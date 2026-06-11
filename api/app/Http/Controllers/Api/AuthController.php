<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\Organisation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
                                            'name' => ['required', 'string', 'max:255'],
                                            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
                                            'password' => ['required', 'string', 'min:8', 'confirmed'],
                                            'organisation_name' => ['nullable', 'string', 'max:255'],
                                        ]);

        $result = DB::transaction(function () use ($validated) {
            $user = User::query()->create([
                                              'name' => $validated['name'],
                                              'email' => strtolower($validated['email']),
                                              'password' => Hash::make($validated['password']),
                                          ]);

            $organisationName = $validated['organisation_name']
                                ?? "{$user->name}'s Organisation";

            $organisation = Organisation::query()->create([
                                                              'owner_id' => $user->id,
                                                              'name' => $organisationName,
                                                              'slug' => $this->generateOrganisationSlug($organisationName),
                                                          ]);

            $organisation->users()->attach($user->id, [
                'role' => 'owner',
            ]);

            $token = $user->createToken('web')->plainTextToken;

            return [
                'user' => $user,
                'organisation' => $organisation,
                'token' => $token,
            ];
        });

        return response()->json($result, 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
                                            'email' => ['required', 'email'],
                                            'password' => ['required', 'string'],
                                        ]);

        $user = User::query()
                    ->where('email', strtolower($validated['email']))
                    ->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                                                        'email' => ['The provided credentials are incorrect.'],
                                                    ]);
        }

        $token = $user->createToken('web')->plainTextToken;

        return response()->json([
                                    'user' => $user,
                                    'token' => $token,
                                ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
                                    'user' => $request->user(),
                                ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
                                    'message' => 'Logged out successfully.',
                                ]);
    }

    private function generateOrganisationSlug(string $name): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 2;

        while (Organisation::query()->where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}
