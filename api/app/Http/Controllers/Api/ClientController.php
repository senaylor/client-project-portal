<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Http\Resources\ClientResource;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $organisation = $request->user()->currentOrganisation();

        $clients = Client::query()
                         ->where('organisation_id', $organisation->id)
                         ->latest()
                         ->get();

        return response()->json([
                                    'clients' => ClientResource::collection($clients),
                                ]);
    }

    public function store(StoreClientRequest $request)
    {
        $organisation = $request->user()->currentOrganisation();

        $client = Client::create([
                                     ...$request->validated(),
                                     'organisation_id' => $organisation->id,
                                     'status' => $data['status'] ?? 'active',
                                 ]);

        return response()->json([
                                    'client' => new ClientResource($client),
                                ], 201);
    }

    public function show(Request $request, Client $client)
    {
        $organisation = $request->user()->currentOrganisation();

        abort_unless($client->organisation_id === $organisation->id, 404);

        return response()->json([
                                    'client' => new ClientResource($client),
                                ]);
    }

    public function update(UpdateClientRequest $request, Client $client)
    {
        $organisation = $request->user()->currentOrganisation();

        abort_unless($client->organisation_id === $organisation->id, 404);

        $client->update($request->validated());

        return response()->json([
                                    'client' => new ClientResource($client->fresh()),
                                ]);
    }

    public function destroy(Request $request, Client $client)
    {
        $organisation = $request->user()->currentOrganisation();

        abort_unless($client->organisation_id === $organisation->id, 404);

        $client->delete();

        return response()->noContent();
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
