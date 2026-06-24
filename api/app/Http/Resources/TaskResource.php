<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'organisation_id' => $this->organisation_id,
            'project_id' => $this->project_id,
            'created_by' => $this->created_by,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'priority' => $this->priority,
            'due_date' => $this->due_date?->toDateString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            'project' => [
                'id' => $this->project_id,
                'name' => $this->project?->name,
                'status' => $this->project?->status,
                'client_id' => $this->project?->client_id,
                'client' => $this->project?->client ? [
                    'id' => $this->project->client_id,
                    'name' => $this->project->client->name,
                ] : null,
            ],
        ];
    }
}
