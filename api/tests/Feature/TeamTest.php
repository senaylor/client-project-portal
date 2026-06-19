<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\CreatesTenantData;
use Tests\TestCase;

class TeamTest extends TestCase
{
    use CreatesTenantData;
    use RefreshDatabase;

    public function test_owner_can_list_team_members(): void
    {
        [$owner, $organisation] = $this->createUserWithOrganisation();

        $member = User::factory()->create();
        $organisation->users()->attach($member->id, [
            'role' => 'member',
        ]);

        Sanctum::actingAs($owner);

        $response = $this->getJson('/api/team');

        $response->assertOk();

        $memberIds = collect($response->json('members'))
            ->pluck('id')
            ->all();

        $this->assertContains($owner->id, $memberIds);
        $this->assertContains($member->id, $memberIds);
    }

    public function test_owner_can_add_existing_user_to_team(): void
    {
        [$owner, $organisation] = $this->createUserWithOrganisation();

        $newUser = User::factory()->create([
                                               'email' => 'new.member@example.com',
                                           ]);

        Sanctum::actingAs($owner);

        $response = $this->postJson('/api/team', [
            'email' => 'new.member@example.com',
            'role' => 'member',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('member.email', 'new.member@example.com')
            ->assertJsonPath('member.role', 'member');

        $this->assertDatabaseHas('organisation_user', [
            'organisation_id' => $organisation->id,
            'user_id' => $newUser->id,
            'role' => 'member',
        ]);
    }

    public function test_admin_can_add_member_to_team(): void
    {
        [$owner, $organisation] = $this->createUserWithOrganisation();

        $admin = User::factory()->create();
        $organisation->users()->attach($admin->id, [
            'role' => 'admin',
        ]);

        $newUser = User::factory()->create([
                                               'email' => 'new.member@example.com',
                                           ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/team', [
            'email' => 'new.member@example.com',
            'role' => 'member',
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('organisation_user', [
            'organisation_id' => $organisation->id,
            'user_id' => $newUser->id,
            'role' => 'member',
        ]);
    }

    public function test_member_cannot_add_team_members(): void
    {
        [$owner, $organisation] = $this->createUserWithOrganisation();

        $member = User::factory()->create();
        $organisation->users()->attach($member->id, [
            'role' => 'member',
        ]);

        $newUser = User::factory()->create([
                                               'email' => 'new.member@example.com',
                                           ]);

        Sanctum::actingAs($member);

        $this->postJson('/api/team', [
            'email' => 'new.member@example.com',
            'role' => 'member',
        ])->assertForbidden();

        $this->assertDatabaseMissing('organisation_user', [
            'organisation_id' => $organisation->id,
            'user_id' => $newUser->id,
        ]);
    }

    public function test_owner_can_change_member_role(): void
    {
        [$owner, $organisation] = $this->createUserWithOrganisation();

        $member = User::factory()->create();
        $organisation->users()->attach($member->id, [
            'role' => 'member',
        ]);

        Sanctum::actingAs($owner);

        $response = $this->patchJson("/api/team/{$member->id}", [
            'role' => 'admin',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('member.role', 'admin');

        $this->assertDatabaseHas('organisation_user', [
            'organisation_id' => $organisation->id,
            'user_id' => $member->id,
            'role' => 'admin',
        ]);
    }

    public function test_admin_cannot_change_member_role(): void
    {
        [$owner, $organisation] = $this->createUserWithOrganisation();

        $admin = User::factory()->create();
        $organisation->users()->attach($admin->id, [
            'role' => 'admin',
        ]);

        $member = User::factory()->create();
        $organisation->users()->attach($member->id, [
            'role' => 'member',
        ]);

        Sanctum::actingAs($admin);

        $this->patchJson("/api/team/{$member->id}", [
            'role' => 'admin',
        ])->assertForbidden();
    }

    public function test_owner_role_cannot_be_changed(): void
    {
        [$owner] = $this->createUserWithOrganisation();

        Sanctum::actingAs($owner);

        $this->patchJson("/api/team/{$owner->id}", [
            'role' => 'member',
        ])->assertUnprocessable();
    }

    public function test_owner_can_remove_member(): void
    {
        [$owner, $organisation] = $this->createUserWithOrganisation();

        $member = User::factory()->create();
        $organisation->users()->attach($member->id, [
            'role' => 'member',
        ]);

        Sanctum::actingAs($owner);

        $this->deleteJson("/api/team/{$member->id}")
             ->assertOk();

        $this->assertDatabaseMissing('organisation_user', [
            'organisation_id' => $organisation->id,
            'user_id' => $member->id,
        ]);
    }

    public function test_member_cannot_remove_team_member(): void
    {
        [$owner, $organisation] = $this->createUserWithOrganisation();

        $member = User::factory()->create();
        $organisation->users()->attach($member->id, [
            'role' => 'member',
        ]);

        $otherMember = User::factory()->create();
        $organisation->users()->attach($otherMember->id, [
            'role' => 'member',
        ]);

        Sanctum::actingAs($member);

        $this->deleteJson("/api/team/{$otherMember->id}")
             ->assertForbidden();

        $this->assertDatabaseHas('organisation_user', [
            'organisation_id' => $organisation->id,
            'user_id' => $otherMember->id,
        ]);
    }

    public function test_owner_cannot_remove_self(): void
    {
        [$owner, $organisation] = $this->createUserWithOrganisation();

        Sanctum::actingAs($owner);

        $this->deleteJson("/api/team/{$owner->id}")
             ->assertUnprocessable();

        $this->assertDatabaseHas('organisation_user', [
            'organisation_id' => $organisation->id,
            'user_id' => $owner->id,
            'role' => 'owner',
        ]);
    }
}
