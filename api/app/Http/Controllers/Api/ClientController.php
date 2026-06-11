<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClientController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $organisation = $request->user()->currentOrganisation();

        $clients = Client::query()
                         ->where('organisation_id', $organisation?->id)
                         ->latest()
                         ->get();

        return response()->json([
                                    'clients' => $clients,
                                ]);
    }

    public function store(Request $request): JsonResponse
    {
        $organisation = $request->user()->currentOrganisation();

        abort_unless($organisation, 403, 'No organisation found for user.');

        $validated = $request->validate([
                                            'name' => ['required', 'string', 'max:255'],
                                            'contact_name' => ['nullable', 'string', 'max:255'],
                                            'contact_email' => ['nullable', 'email', 'max:255'],
                                            'status' => ['nullable', Rule::in(['active', 'archived'])],
                                        ]);

        $client = Client::query()->create([
                                              ...$validated,
                                              'organisation_id' => $organisation->id,
                                              'status' => $validated['status'] ?? 'active',
                                          ]);

        return response()->json([
                                    'client' => $client,
                                ], 201);
    }

    public function show(Request $request, Client $client): JsonResponse
    {
        $this->ensureClientBelongsToCurrentOrganisation($request, $client);

        return response()->json([
                                    'client' => $client,
                                ]);
    }

    public function update(Request $request, Client $client): JsonResponse
    {
        $this->ensureClientBelongsToCurrentOrganisation($request, $client);

        $validated = $request->validate([
                                            'name' => ['sometimes', 'required', 'string', 'max:255'],
                                            'contact_name' => ['nullable', 'string', 'max:255'],
                                            'contact_email' => ['nullable', 'email', 'max:255'],
                                            'status' => ['sometimes', Rule::in(['active', 'archived'])],
                                        ]);

        $client->update($validated);

        return response()->json([
                                    'client' => $client->refresh(),
                                ]);
    }

    public function destroy(Request $request, Client $client): JsonResponse
    {
        $this->ensureClientBelongsToCurrentOrganisation($request, $client);

        $client->delete();

        return response()->json([
                                    'message' => 'Client deleted successfully.',
                                ]);
    }

    private function ensureClientBelongsToCurrentOrganisation(Request $request, Client $client): void
    {
        $organisation = $request->user()->currentOrganisation();

        abort_unless(
            $organisation && $client->organisation_id === $organisation->id,
            404
        );
    }
}
