<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\CreatesTenantData;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use CreatesTenantData;
    use RefreshDatabase;

    public function test_user_can_create_task_for_project_in_current_organisation(): void
    {
        [$user, $organisation] = $this->createUserWithOrganisation();
        $project = $this->createProjectForOrganisation($organisation, creator: $user);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/tasks', [
            'project_id' => $project->id,
            'title' => 'Prepare homepage wireframes',
            'description' => 'Create initial layout concepts.',
            'status' => 'todo',
            'priority' => 'high',
            'due_date' => now()->addWeek()->toDateString(),
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('task.title', 'Prepare homepage wireframes')
            ->assertJsonPath('task.organisation_id', $organisation->id)
            ->assertJsonPath('task.project.id', $project->id)
            ->assertJsonPath('task.priority', 'high');

        $this->assertDatabaseHas('tasks', [
            'organisation_id' => $organisation->id,
            'project_id' => $project->id,
            'title' => 'Prepare homepage wireframes',
        ]);
    }

    public function test_user_cannot_create_task_for_other_organisation_project(): void
    {
        [$user] = $this->createUserWithOrganisation();
        [, $otherOrganisation] = $this->createUserWithOrganisation();

        $otherProject = $this->createProjectForOrganisation($otherOrganisation);

        Sanctum::actingAs($user);

        $this->postJson('/api/tasks', [
            'project_id' => $otherProject->id,
            'title' => 'Illegal Task',
            'status' => 'todo',
            'priority' => 'medium',
        ])->assertNotFound();
    }

    public function test_user_only_lists_tasks_from_current_organisation(): void
    {
        [$user, $organisation] = $this->createUserWithOrganisation();
        [, $otherOrganisation] = $this->createUserWithOrganisation();

        $visibleTask = $this->createTaskForOrganisation($organisation);
        $hiddenTask = $this->createTaskForOrganisation($otherOrganisation);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/tasks');

        $response->assertOk();

        $taskIds = collect($response->json('tasks'))
            ->pluck('id')
            ->all();

        $this->assertContains($visibleTask->id, $taskIds);
        $this->assertNotContains($hiddenTask->id, $taskIds);
    }

    public function test_user_can_update_own_organisation_task(): void
    {
        [$user, $organisation] = $this->createUserWithOrganisation();

        $task = $this->createTaskForOrganisation($organisation);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/tasks/{$task->id}", [
            'title' => 'Updated Task',
            'status' => 'done',
            'priority' => 'low',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('task.title', 'Updated Task')
            ->assertJsonPath('task.status', 'done')
            ->assertJsonPath('task.priority', 'low');
    }

    public function test_user_cannot_view_other_organisation_task(): void
    {
        [$user] = $this->createUserWithOrganisation();
        [, $otherOrganisation] = $this->createUserWithOrganisation();

        $task = $this->createTaskForOrganisation($otherOrganisation);

        Sanctum::actingAs($user);

        $this->getJson("/api/tasks/{$task->id}")
             ->assertNotFound();
    }

    public function test_user_can_delete_own_organisation_task(): void
    {
        [$user, $organisation] = $this->createUserWithOrganisation();

        $task = $this->createTaskForOrganisation($organisation);

        Sanctum::actingAs($user);

        $this->deleteJson("/api/tasks/{$task->id}")
             ->assertOk();

        $this->assertDatabaseMissing('tasks', [
            'id' => $task->id,
        ]);
    }
}
