<?php

namespace Tests;

use App\Models\Client;
use App\Models\Organisation;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Str;

trait CreatesTenantData
{
    protected function createUserWithOrganisation(string $role = 'owner'): array
    {
        $user = User::factory()->create();

        $organisation = Organisation::query()->create([
            'owner_id' => $user->id,
            'name' => fake()->company(),
            'slug' => Str::slug(fake()->company() . '-' . Str::random(6)),
        ]);

        $organisation->users()->attach($user->id, [
            'role' => $role,
            ]);

        return [$user, $organisation];
    }

    protected function createClientForOrganisation(Organisation $organisation): Client
    {
        return Client::query()->create([
                                           'organisation_id' => $organisation->id,
                                           'name' => fake()->company(),
                                           'contact_name' => fake()->name(),
                                           'contact_email' => fake()->safeEmail(),
                                           'status' => 'active',
                                       ]);
    }

    protected function createProjectForOrganisation(
        Organisation $organisation,
        ?Client $client = null,
        ?User $creator = null,
    ): Project {
        $client ??= $this->createClientForOrganisation($organisation);
        $creator ??= $organisation->owner;

        return Project::query()->create([
                                            'organisation_id' => $organisation->id,
                                            'client_id' => $client->id,
                                            'created_by' => $creator->id,
                                            'name' => fake()->words(3, true),
                                            'description' => fake()->sentence(),
                                            'status' => 'active',
                                            'due_date' => now()->addWeek()->toDateString(),
                                        ]);
    }

    protected function createTaskForOrganisation(
        Organisation $organisation,
        ?Project $project = null,
        ?User $creator = null,
    ): Task {
        $project ??= $this->createProjectForOrganisation($organisation);
        $creator ??= $organisation->owner;

        return Task::query()->create([
                                         'organisation_id' => $organisation->id,
                                         'project_id' => $project->id,
                                         'created_by' => $creator->id,
                                         'assigned_to' => null,
                                         'title' => fake()->sentence(4),
                                         'description' => fake()->sentence(),
                                         'status' => 'todo',
                                         'priority' => 'medium',
                                         'due_date' => now()->addDays(3)->toDateString(),
                                     ]);
    }

}
