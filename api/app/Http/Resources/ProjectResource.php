<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'organisation_id' => $this->organisation_id,
            'client_id' => $this->client_id,
            'created_by' => $this->created_by,
            'name' => $this->name,
            'description' => $this->description,
            'status' => $this->status,
            'due_date' => $this->due_date,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            'client' => [
                'id' => $this->client_id,
                'name' => $this->name,
                'contact_name' => $this->contact_name,
                'contact_email' => $this->contact_email,
                'status' => $this->status,
            ],
        ];
    }
}
