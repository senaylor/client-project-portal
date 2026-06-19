<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function ownedOrganisations(): HasMany
    {
        return $this->hasMany(Organisation::class, 'owner_id');
    }

    public function organisations(): BelongsToMany
    {
        return $this->belongsToMany(Organisation::class)
                    ->withPivot('role')
                    ->withTimestamps();
    }

    public function currentOrganisation(): ?Organisation
    {
        return $this->organisations()->first();
    }

    public function createdTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'created_by');
    }

    public function assignedTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    public function roleForOrganisation(Organisation $organisation): ?string
    {
        $membership = $this->organisations()
                           ->where('organisations.id', $organisation->id)
                           ->first();

        return $membership?->pivot?->role;
    }

    public function isOwnerOf(Organisation $organisation): bool
    {
        return $this->roleForOrganisation($organisation) === 'owner';
    }

    public function isAdminOf(Organisation $organisation): bool
    {
        return $this->roleForOrganisation($organisation) === 'admin';
    }

    public function canManageTeamFor(Organisation $organisation): bool
    {
        return in_array($this->roleForOrganisation($organisation), ['owner', 'admin'], true);
    }

}
