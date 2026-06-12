<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $organisation = $request->user()->currentOrganisation();

        $projects = Project::query()
                           ->with('client:id,name')
                           ->where('organisation_id', $organisation?->id)
                           ->latest()
                           ->get();

        return response()->json([
                                    'projects' => $projects,
                                ]);
    }

    public function store(Request $request): JsonResponse
    {
        $organisation = $request->user()->currentOrganisation();

        abort_unless($organisation, 403, 'No organisation found for user.');

        $validated = $request->validate([
                                            'client_id' => ['required', 'integer'],
                                            'name' => ['required', 'string', 'max:255'],
                                            'description' => ['nullable', 'string'],
                                            'status' => ['nullable', Rule::in(['active', 'on_hold', 'completed', 'archived'])],
                                            'due_date' => ['nullable', 'date'],
                                        ]);

        $client = Client::query()
                        ->where('organisation_id', $organisation->id)
                        ->whereKey($validated['client_id'])
                        ->firstOrFail();

        $project = Project::query()->create([
                                                'organisation_id' => $organisation->id,
                                                'client_id' => $client->id,
                                                'created_by' => $request->user()->id,
                                                'name' => $validated['name'],
                                                'description' => $validated['description'] ?? null,
                                                'status' => $validated['status'] ?? 'active',
                                                'due_date' => $validated['due_date'] ?? null,
                                            ]);

        $project->load('client:id,name');

        return response()->json([
                                    'project' => $project,
                                ], 201);
    }

    public function show(Request $request, Project $project): JsonResponse
    {
        $this->ensureProjectBelongsToCurrentOrganisation($request, $project);

        $project->load('client:id,name');

        return response()->json([
                                    'project' => $project,
                                ]);
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        $this->ensureProjectBelongsToCurrentOrganisation($request, $project);

        $organisation = $request->user()->currentOrganisation();

        $validated = $request->validate([
                                            'client_id' => ['sometimes', 'required', 'integer'],
                                            'name' => ['sometimes', 'required', 'string', 'max:255'],
                                            'description' => ['nullable', 'string'],
                                            'status' => ['sometimes', Rule::in(['active', 'on_hold', 'completed', 'archived'])],
                                            'due_date' => ['nullable', 'date'],
                                        ]);

        if (array_key_exists('client_id', $validated)) {
            Client::query()
                  ->where('organisation_id', $organisation?->id)
                  ->whereKey($validated['client_id'])
                  ->firstOrFail();
        }

        $project->update($validated);

        $project->load('client:id,name');

        return response()->json([
                                    'project' => $project->refresh(),
                                ]);
    }

    public function destroy(Request $request, Project $project): JsonResponse
    {
        $this->ensureProjectBelongsToCurrentOrganisation($request, $project);

        $project->delete();

        return response()->json([
                                    'message' => 'Project deleted successfully.',
                                ]);
    }

    private function ensureProjectBelongsToCurrentOrganisation(Request $request, Project $project): void
    {
        $organisation = $request->user()->currentOrganisation();

        abort_unless(
            $organisation && $project->organisation_id === $organisation->id,
            404
        );
    }
}
