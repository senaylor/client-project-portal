<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Client;

class Project extends Model
{
    protected $fillable = [
        'organisation_id',
        'client_id',
        'created_by',
        'name',
        'description',
        'status',
        'due_date',
    ];

    protected function casts() : array
    {
        return [
            'due_date' => 'date',
        ];
    }

    public function organisation() : BelongsTo
    {
        return $this->belongsTo(Organisation::class);
    }

    public function client() : BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function creator() : BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function tasks() : HasMany
    {
        return $this->hasMany(Task::class);
    }
}
