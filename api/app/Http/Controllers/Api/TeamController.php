<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TeamController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $organisation = $request->user()->currentOrganisation();

        abort_unless($organisation, 403, 'No organisation found for user.');

        $members = $organisation->users()
                                ->select('users.id', 'users.name', 'users.email')
                                ->orderBy('users.name')
                                ->get()
                                ->map(function (User $user) {
                                    return [
                                        'id' => $user->id,
                                        'name' => $user->name,
                                        'email' => $user->email,
                                        'role' => $user->pivot->role,
                                        'joined_at' => $user->pivot->created_at,
                                    ];
                                });

        return response()->json([
                                    'members' => $members,
                                ]);
    }

    public function store(Request $request): JsonResponse
    {
        $organisation = $request->user()->currentOrganisation();

        abort_unless($organisation, 403, 'No organisation found for user.');
        abort_unless($request->user()->canManageTeamFor($organisation), 403);

        $validated = $request->validate([
                                            'email' => ['required', 'email', 'exists:users,email'],
                                            'role' => ['required', Rule::in(['admin', 'member'])],
                                        ]);

        $userToAdd = User::query()
                         ->where('email', strtolower($validated['email']))
                         ->firstOrFail();

        $alreadyMember = $organisation->users()
                                      ->where('users.id', $userToAdd->id)
                                      ->exists();

        abort_if($alreadyMember, 422, 'User is already a member of this organisation.');

        $organisation->users()->attach($userToAdd->id, [
            'role' => $validated['role'],
        ]);

        return response()->json([
                                    'member' => [
                                        'id' => $userToAdd->id,
                                        'name' => $userToAdd->name,
                                        'email' => $userToAdd->email,
                                        'role' => $validated['role'],
                                    ],
                                ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $organisation = $request->user()->currentOrganisation();

        abort_unless($organisation, 403, 'No organisation found for user.');
        abort_unless($request->user()->isOwnerOf($organisation), 403);

        $validated = $request->validate([
                                            'role' => ['required', Rule::in(['admin', 'member'])],
                                        ]);

        $targetRole = $user->roleForOrganisation($organisation);

        abort_unless($targetRole, 404);
        abort_if($targetRole === 'owner', 422, 'The owner role cannot be changed.');

        $organisation->users()->updateExistingPivot($user->id, [
            'role' => $validated['role'],
        ]);

        return response()->json([
                                    'member' => [
                                        'id' => $user->id,
                                        'name' => $user->name,
                                        'email' => $user->email,
                                        'role' => $validated['role'],
                                    ],
                                ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $organisation = $request->user()->currentOrganisation();

        abort_unless($organisation, 403, 'No organisation found for user.');
        abort_unless($request->user()->canManageTeamFor($organisation), 403);

        $targetRole = $user->roleForOrganisation($organisation);

        abort_unless($targetRole, 404);
        abort_if($targetRole === 'owner', 422, 'The owner cannot be removed from the organisation.');
        abort_if($request->user()->id === $user->id, 422, 'You cannot remove yourself.');

        if ($request->user()->isAdminOf($organisation)) {
            abort_if($targetRole === 'admin', 403, 'Admins cannot remove other admins.');
        }

        $organisation->users()->detach($user->id);

        return response()->json([
                                    'message' => 'Team member removed successfully.',
                                ]);
    }
}
