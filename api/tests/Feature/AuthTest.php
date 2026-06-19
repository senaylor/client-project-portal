<?php

namespace Tests\Feature;

use App\Models\Organisation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_get_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Tom Denver',
            'email' => 'tom@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'organisation_name' => 'Acme Studio',
        ]);

        $response
            ->assertCreated()
            ->assertJsonStructure([
                                      'user' => [
                                          'id',
                                          'name',
                                          'email',
                                      ],
                                      'organisation' => [
                                          'id',
                                          'owner_id',
                                          'name',
                                          'slug',
                                      ],
                                      'token',
                                  ]);

        $this->assertDatabaseHas('users', [
            'email' => 'tom@example.com',
        ]);

        $this->assertDatabaseHas('organisations', [
            'name' => 'Acme Studio',
        ]);

        $organisation = Organisation::query()->where('name', 'Acme Studio')->firstOrFail();

        $this->assertDatabaseHas('organisation_user', [
            'organisation_id' => $organisation->id,
            'role' => 'owner',
        ]);
    }

    public function test_user_can_login(): void
    {
        $user = User::factory()->create([
                                            'email' => 'tom@example.com',
                                            'password' => bcrypt('password123'),
                                        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'tom@example.com',
            'password' => 'password123',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonStructure([
                                      'user',
                                      'token',
                                  ]);
    }

    public function test_user_cannot_login_with_invalid_password(): void
    {
        User::factory()->create([
                                    'email' => 'tom@example.com',
                                    'password' => bcrypt('password123'),
                                ]);

        $response = $this->postJson('/api/login', [
            'email' => 'tom@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertUnprocessable();
    }

    public function test_authenticated_user_can_fetch_me(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/me');

        $response
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', $user->email);
    }

    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();

        $token = $user->createToken('web')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
                         ->postJson('/api/logout');

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Logged out successfully.');

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
