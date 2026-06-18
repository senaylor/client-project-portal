<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $organisation = $request->user()->currentOrganisation();

        abort_unless($organisation, 403, 'No organisation found for user.');

        $totalClients = Client::query()
                              ->where('organisation_id', $organisation->id)
                              ->count();

        $activeProjects = Project::query()
                                 ->where('organisation_id', $organisation->id)
                                 ->where('status', 'active')
                                 ->count();

        $openTasks = Task::query()
                         ->where('organisation_id', $organisation->id)
                         ->where('status', '!=', 'done')
                         ->count();

        $overdueTasks = Task::query()
                            ->where('organisation_id', $organisation->id)
                            ->where('status', '!=', 'done')
                            ->whereDate('due_date', '<', now()->toDateString())
                            ->count();

        $recentTasks = Task::query()
                           ->with([
                                      'project:id,name,client_id',
                                      'project.client:id,name',
                                      'assignee:id,name,email',
                                  ])
                           ->where('organisation_id', $organisation->id)
                           ->latest()
                           ->limit(5)
                           ->get();

        return response()->json([
                                    'summary' => [
                                        'total_clients' => $totalClients,
                                        'active_projects' => $activeProjects,
                                        'open_tasks' => $openTasks,
                                        'overdue_tasks' => $overdueTasks,
                                    ],
                                    'recent_tasks' => $recentTasks,
                                ]);
    }
}
