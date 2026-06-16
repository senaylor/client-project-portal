<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $organisation = $request->user()->currentOrganisation();

        $tasks = Task::query()
                     ->with([
                                'project:id,name,client_id',
                                'project.client:id,name',
                                'assignee:id,name,email',
                            ])
                     ->where('organisation_id', $organisation?->id)
                     ->latest()
                     ->get();

        return response()->json([
                                    'tasks' => $tasks,
                                ]);
    }

    public function store(Request $request): JsonResponse
    {
        $organisation = $request->user()->currentOrganisation();

        abort_unless($organisation, 403, 'No organisation found for user.');

        $validated = $request->validate([
                                            'project_id' => ['required', 'integer'],
                                            'assigned_to' => ['nullable', 'integer'],
                                            'title' => ['required', 'string', 'max:255'],
                                            'description' => ['nullable', 'string'],
                                            'status' => ['nullable', Rule::in(['todo', 'in_progress', 'done', 'blocked'])],
                                            'priority' => ['nullable', Rule::in(['low', 'medium', 'high'])],
                                            'due_date' => ['nullable', 'date'],
                                        ]);

        $project = Project::query()
                          ->where('organisation_id', $organisation->id)
                          ->whereKey($validated['project_id'])
                          ->firstOrFail();

        if (! empty($validated['assigned_to'])) {
            User::query()
                ->whereKey($validated['assigned_to'])
                ->whereHas('organisations', function ($query) use ($organisation) {
                    $query->where('organisations.id', $organisation->id);
                })
                ->firstOrFail();
        }

        $task = Task::query()->create([
                                          'organisation_id' => $organisation->id,
                                          'project_id' => $project->id,
                                          'created_by' => $request->user()->id,
                                          'assigned_to' => $validated['assigned_to'] ?? null,
                                          'title' => $validated['title'],
                                          'description' => $validated['description'] ?? null,
                                          'status' => $validated['status'] ?? 'todo',
                                          'priority' => $validated['priority'] ?? 'medium',
                                          'due_date' => $validated['due_date'] ?? null,
                                      ]);

        $task->load([
                        'project:id,name,client_id',
                        'project.client:id,name',
                        'assignee:id,name,email',
                    ]);

        return response()->json([
                                    'task' => $task,
                                ], 201);
    }

    public function show(Request $request, Task $task): JsonResponse
    {
        $this->ensureTaskBelongsToCurrentOrganisation($request, $task);

        $task->load([
                        'project:id,name,client_id',
                        'project.client:id,name',
                        'assignee:id,name,email',
                    ]);

        return response()->json([
                                    'task' => $task,
                                ]);
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        $this->ensureTaskBelongsToCurrentOrganisation($request, $task);

        $organisation = $request->user()->currentOrganisation();

        $validated = $request->validate([
                                            'project_id' => ['sometimes', 'required', 'integer'],
                                            'assigned_to' => ['nullable', 'integer'],
                                            'title' => ['sometimes', 'required', 'string', 'max:255'],
                                            'description' => ['nullable', 'string'],
                                            'status' => ['sometimes', Rule::in(['todo', 'in_progress', 'done', 'blocked'])],
                                            'priority' => ['sometimes', Rule::in(['low', 'medium', 'high'])],
                                            'due_date' => ['nullable', 'date'],
                                        ]);

        if (array_key_exists('project_id', $validated)) {
            Project::query()
                   ->where('organisation_id', $organisation?->id)
                   ->whereKey($validated['project_id'])
                   ->firstOrFail();
        }

        if (array_key_exists('assigned_to', $validated) && $validated['assigned_to'] !== null) {
            User::query()
                ->whereKey($validated['assigned_to'])
                ->whereHas('organisations', function ($query) use ($organisation) {
                    $query->where('organisations.id', $organisation?->id);
                })
                ->firstOrFail();
        }

        $task->update($validated);

        $task->load([
                        'project:id,name,client_id',
                        'project.client:id,name',
                        'assignee:id,name,email',
                    ]);

        return response()->json([
                                    'task' => $task->refresh(),
                                ]);
    }

    public function destroy(Request $request, Task $task): JsonResponse
    {
        $this->ensureTaskBelongsToCurrentOrganisation($request, $task);

        $task->delete();

        return response()->json([
                                    'message' => 'Task deleted successfully.',
                                ]);
    }

    private function ensureTaskBelongsToCurrentOrganisation(Request $request, Task $task): void
    {
        $organisation = $request->user()->currentOrganisation();

        abort_unless(
            $organisation && $task->organisation_id === $organisation->id,
            404
        );
    }
}
