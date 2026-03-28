<?php

namespace App\Services;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceTemplate;
use Illuminate\Support\Facades\DB;

class WorkspaceTemplateService
{
    /**
     * Create a template from an existing workspace
     */
    public function createFromWorkspace(User $user, Workspace $workspace, array $data): WorkspaceTemplate
    {
        $configuration = $this->extractWorkspaceConfiguration($workspace);

        return WorkspaceTemplate::create([
            'user_id' => $user->id,
            'workspace_id' => $workspace->id,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'icon' => $data['icon'],
            'is_public' => $data['is_public'] ?? false,
            'category' => $data['category'],
            'configuration' => $configuration,
            'usage_count' => 0,
        ]);
    }

    /**
     * Extract configuration from a workspace for templating
     */
    private function extractWorkspaceConfiguration(Workspace $workspace): array
    {
        return [
            'settings' => [
                'timezone' => $workspace->timezone,
                'date_format' => $workspace->date_format,
                'language' => $workspace->language,
            ],
            'features' => [
                'two_factor_required' => $workspace->two_factor_required,
                'allowed_email_domains' => $workspace->allowed_email_domains,
            ],
            'webhooks_structure' => $workspace->webhookEndpoints()
                ->select('url', 'events', 'secret', 'is_active')
                ->get()
                ->toArray(),
            'api_keys_structure' => [
                'scopes' => ['read', 'write'], // Default scopes for new keys
            ],
            'default_roles' => [
                'admin_permissions' => ['manage_team', 'manage_billing', 'manage_webhooks', 'view_activity_logs'],
                'member_permissions' => [],
            ],
            'custom_fields' => $workspace->customFieldDefinitions()
                ->select('name', 'key', 'type', 'options', 'required', 'default_value')
                ->get()
                ->toArray(),
        ];
    }

    /**
     * Create a new workspace from a template
     */
    public function createWorkspaceFromTemplate(User $user, WorkspaceTemplate $template, array $data): Workspace
    {
        return DB::transaction(function () use ($user, $template, $data) {
            // Create the workspace
            $workspace = Workspace::create([
                'name' => $data['name'],
                'slug' => $data['slug'],
                'owner_id' => $user->id,
                'plan' => 'free',
                'timezone' => $template->configuration['settings']['timezone'] ?? 'UTC',
                'date_format' => $template->configuration['settings']['date_format'] ?? 'Y-m-d',
                'language' => $template->configuration['settings']['language'] ?? 'en',
                'two_factor_required' => $template->configuration['features']['two_factor_required'] ?? false,
                'allowed_email_domains' => $template->configuration['features']['allowed_email_domains'] ?? null,
            ]);

            // Attach owner as admin
            $workspace->users()->attach($user->id, ['role' => 'owner']);

            // Create custom fields from template
            if (! empty($template->configuration['custom_fields'])) {
                foreach ($template->configuration['custom_fields'] as $field) {
                    $workspace->customFieldDefinitions()->create([
                        'name' => $field['name'],
                        'key' => $field['key'].'_'.uniqid(), // Ensure unique key
                        'type' => $field['type'],
                        'options' => $field['options'] ?? null,
                        'required' => $field['required'] ?? false,
                        'default_value' => $field['default_value'] ?? null,
                        'order' => 0,
                    ]);
                }
            }

            // Create webhook structure (without secrets - user must configure)
            if (! empty($template->configuration['webhooks_structure'])) {
                foreach ($template->configuration['webhooks_structure'] as $webhook) {
                    $workspace->webhookEndpoints()->create([
                        'url' => $webhook['url'],
                        'events' => $webhook['events'],
                        'secret' => bin2hex(random_bytes(16)), // New random secret
                        'is_active' => false, // Inactive until verified
                    ]);
                }
            }

            // Increment template usage count
            $template->incrementUsage();

            // Switch user to new workspace
            $user->switchWorkspace($workspace);

            return $workspace;
        });
    }

    /**
     * Duplicate an existing template
     */
    public function duplicateTemplate(User $user, WorkspaceTemplate $template): WorkspaceTemplate
    {
        return WorkspaceTemplate::create([
            'user_id' => $user->id,
            'workspace_id' => $template->workspace_id,
            'name' => $template->name.' (Copy)',
            'description' => $template->description,
            'icon' => $template->icon,
            'is_public' => false, // Duplicates are private by default
            'category' => $template->category,
            'configuration' => $template->configuration,
            'usage_count' => 0,
        ]);
    }
}
