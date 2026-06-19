<?php

namespace Tests\Feature;

use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\CreatesTenantData;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use CreatesTenantData;
    use RefreshDatabase;

    public function test_dashboard_returns_tenant_scoped_summary(): void
    {
        [$user, $organisation] = $this->createUserWithOrganisation();
        [, $otherOrganisation] = $this->createUserWithOrganisation();

        $client = $this->createClientForOrganisation($organisation);
        $project = $this->createProjectForOrganisation($organisation, $client, $user);

        $this->createTaskForOrganisation($organisation, $project, $user);

        Task::query()->create([
                                  'organisation_id' => $organisation->id,
                                  'project_id' => $project->id,
                                  'created_by' => $user->id,
                                  'assigned_to' => null,
                                  'title' => 'Overdue task',
                                  'description' => null,
                                  'status' => 'todo',
                                  'priority' => 'high',
                                  'due_date' => now()->subDay()->toDateString(),
                              ]);

        $this->createClientForOrganisation($otherOrganisation);
        $this->createProjectForOrganisation($otherOrganisation);
        $this->createTaskForOrganisation($otherOrganisation);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/dashboard');

        $response
            ->assertOk()
            ->assertJsonPath('summary.total_clients', 1)
            ->assertJsonPath('summary.active_projects', 1)
            ->assertJsonPath('summary.open_tasks', 2)
            ->assertJsonPath('summary.overdue_tasks', 1)
            ->assertJsonCount(2, 'recent_tasks');
    }
}
