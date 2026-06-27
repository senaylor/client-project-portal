<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\CreatesTenantData;
use Tests\TestCase;

class ProjectTest extends TestCase
{
    use CreatesTenantData;
    use RefreshDatabase;

    public function test_user_can_create_project_for_client_in_current_organisation(): void
    {
        [$user, $organisation] = $this->createUserWithOrganisation();
        $client = $this->createClientForOrganisation($organisation);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/projects', [
            'client_id' => $client->id,
            'name' => 'Website Redesign',
            'description' => 'Redesign the public website.',
            'status' => 'active',
            'due_date' => now()->addMonth()->toDateString(),
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('project.name', 'Website Redesign')
            ->assertJsonPath('project.organisation_id', $organisation->id)
            ->assertJsonPath('project.client.id', $client->id);

        $this->assertDatabaseHas('projects', [
            'organisation_id' => $organisation->id,
            'client_id' => $client->id,
            'name' => 'Website Redesign',
        ]);
    }

    public function test_user_cannot_create_project_for_other_organisation_client(): void
    {
        [$user] = $this->createUserWithOrganisation();
        [, $otherOrganisation] = $this->createUserWithOrganisation();

        $otherClient = $this->createClientForOrganisation($otherOrganisation);

        Sanctum::actingAs($user);

        $this->postJson('/api/projects', [
            'client_id' => $otherClient->id,
            'name' => 'Illegal Project',
            'status' => 'active',
        ])->assertNotFound();
    }

    public function test_user_only_lists_projects_from_current_organisation(): void
    {
        [$user, $organisation] = $this->createUserWithOrganisation();
        [, $otherOrganisation] = $this->createUserWithOrganisation();

        $visibleProject = $this->createProjectForOrganisation($organisation);
        $hiddenProject = $this->createProjectForOrganisation($otherOrganisation);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/projects');

        $response->assertOk();

        $projectIds = collect($response->json('projects'))
            ->pluck('id')
            ->all();

        $this->assertContains($visibleProject->id, $projectIds);
        $this->assertNotContains($hiddenProject->id, $projectIds);
    }

    public function test_user_can_update_own_organisation_project(): void
    {
        [$user, $organisation] = $this->createUserWithOrganisation();

        $project = $this->createProjectForOrganisation($organisation);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/projects/{$project->id}", [
            'name' => 'Updated Project',
            'status' => 'completed',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('project.name', 'Updated Project')
            ->assertJsonPath('project.status', 'completed');
    }

    public function test_user_cannot_view_other_organisation_project(): void
    {
        [$user] = $this->createUserWithOrganisation();
        [, $otherOrganisation] = $this->createUserWithOrganisation();

        $project = $this->createProjectForOrganisation($otherOrganisation);

        Sanctum::actingAs($user);

        $this->getJson("/api/projects/{$project->id}")
             ->assertNotFound();
    }

    public function test_user_can_delete_own_organisation_project(): void
    {
        [$user, $organisation] = $this->createUserWithOrganisation();

        $project = $this->createProjectForOrganisation($organisation);

        Sanctum::actingAs($user);

        $this->deleteJson("/api/projects/{$project->id}")
             ->assertNoContent();

        $this->assertDatabaseMissing('projects', [
            'id' => $project->id,
        ]);
    }
}
