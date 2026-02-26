<?php

namespace App\Services;

use App\Models\Workspace;

class WorkspaceExportService
{
    /**
     * Gather all data related to a workspace for export.
     */
    public function getExportData(Workspace $workspace): array
    {
        return [
            'workspace' => [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'slug' => $workspace->slug,
                'created_at' => $workspace->created_at->toIso8601String(),
                'updated_at' => $workspace->updated_at->toIso8601String(),
            ],
            'members' => $workspace->users->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->pivot->role,
                'joined_at' => $user->pivot->created_at?->toIso8601String(),
            ])->toArray(),
            'invitations' => $workspace->invitations->map(fn ($invitation) => [
                'id' => $invitation->id,
                'email' => $invitation->email,
                'role' => $invitation->role,
                'created_at' => $invitation->created_at->toIso8601String(),
            ])->toArray(),
            'api_keys' => $workspace->apiKeys->map(fn ($key) => [
                'id' => $key->id,
                'name' => $key->name,
                'created_at' => $key->created_at->toIso8601String(),
                'last_used_at' => $key->last_used_at?->toIso8601String(),
            ])->toArray(),
            'webhook_endpoints' => $workspace->webhookEndpoints->map(fn ($endpoint) => [
                'id' => $endpoint->id,
                'url' => $endpoint->url,
                'description' => $endpoint->description,
                'created_at' => $endpoint->created_at->toIso8601String(),
            ])->toArray(),
            'activity_logs' => \Spatie\Activitylog\Models\Activity::where('log_name', 'workspace')
                ->where('subject_id', $workspace->id)
                ->where('subject_type', Workspace::class)
                ->latest()
                ->get()
                ->map(fn ($log) => [
                    'id' => $log->id,
                    'description' => $log->description,
                    'event' => $log->event,
                    'properties' => $log->properties,
                    'created_at' => $log->created_at->toIso8601String(),
                ])->toArray(),
        ];
    }
}
