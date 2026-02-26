<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->whenPivotLoaded('workspace_user', function () {
                return $this->pivot->role;
            }),
            'joined_at' => $this->whenPivotLoaded('workspace_user', function () {
                return $this->pivot->created_at;
            }),
        ];
    }
}
