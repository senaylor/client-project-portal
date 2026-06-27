<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\CreatesTenantData;
use Tests\TestCase;

class ClientTest extends TestCase
{
    use CreatesTenantData;
    use RefreshDatabase;

    public function test_user_can_create_client_for_current_organisation(): void
    {
        [$user, $organisation] = $this->createUserWithOrganisation();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/clients', [
            'name' => 'Acme Pty Ltd',
            'contact_name' => 'Jane Smith',
            'contact_email' => 'jane@acme.test',
            'status' => 'active',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('client.name', 'Acme Pty Ltd')
            ->assertJsonPath('client.organisation_id', $organisation->id);

        $this->assertDatabaseHas('clients', [
            'organisation_id' => $organisation->id,
            'name' => 'Acme Pty Ltd',
        ]);
    }

    public function test_user_only_lists_clients_from_current_organisation(): void
    {
        [$user, $organisation] = $this->createUserWithOrganisation();
        [, $otherOrganisation] = $this->createUserWithOrganisation();

        $visibleClient = $this->createClientForOrganisation($organisation);
        $hiddenClient = $this->createClientForOrganisation($otherOrganisation);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/clients');

        $response->assertOk();

        $clientIds = collect($response->json('clients'))
            ->pluck('id')
            ->all();

        $this->assertContains($visibleClient->id, $clientIds);
        $this->assertNotContains($hiddenClient->id, $clientIds);
    }

    public function test_user_can_update_own_organisation_client(): void
    {
        [$user, $organisation] = $this->createUserWithOrganisation();

        $client = $this->createClientForOrganisation($organisation);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/clients/{$client->id}", [
            'name' => 'Updated Client',
            'status' => 'archived',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('client.name', 'Updated Client')
            ->assertJsonPath('client.status', 'archived');
    }

    public function test_user_cannot_view_other_organisation_client(): void
    {
        [$user] = $this->createUserWithOrganisation();
        [, $otherOrganisation] = $this->createUserWithOrganisation();

        $client = $this->createClientForOrganisation($otherOrganisation);

        Sanctum::actingAs($user);

        $this->getJson("/api/clients/{$client->id}")
             ->assertNotFound();
    }

    public function test_user_can_delete_own_organisation_client(): void
    {
        [$user, $organisation] = $this->createUserWithOrganisation();

        $client = $this->createClientForOrganisation($organisation);

        Sanctum::actingAs($user);

        $this->deleteJson("/api/clients/{$client->id}")
             ->assertNoContent();

        $this->assertDatabaseMissing('clients', [
            'id' => $client->id,
        ]);
    }
}
