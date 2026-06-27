<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Client;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $organisation = $request->user()->currentOrganisation();

        $projects = Project::query()
                           ->with('client')
                           ->where('organisation_id', $organisation?->id)
                           ->latest()
                           ->get();

        return response()->json([
                                    'projects' => ProjectResource::collection($projects),
                                ]);
    }

    public function store(StoreProjectRequest $request)
    {
        $organisation = $request->user()->currentOrganisation();

        $data = $request->validated();

        $client = Client::query()
                        ->where('organisation_id', $organisation->id)
                        ->findOrFail($data['client_id']);

        $project = Project::create([
                                       ...$data,
                                       'client_id' => $client->id,
                                       'organisation_id' => $organisation->id,
                                       'created_by' => $request->user()->id,
                                       'status' => $data['status'] ?? 'active',
                                   ]);

        $project->load('client');

        return response()->json([
                                    'project' => new ProjectResource($project),
                                ], 201);
    }

    public function show(Request $request, Project $project): JsonResponse
    {
        $this->ensureProjectBelongsToCurrentOrganisation($request, $project);

        $project->load('client');

        return response()->json([
                                    'project' => new ProjectResource($project),
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

        $project->load('client');

        return response()->json([
                                    'project' => new ProjectResource($project->refresh()),
                                ]);
    }

    public function destroy(Request $request, Project $project): Response
    {
        $this->ensureProjectBelongsToCurrentOrganisation($request, $project);

        $project->delete();

        return response()->noContent();
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
