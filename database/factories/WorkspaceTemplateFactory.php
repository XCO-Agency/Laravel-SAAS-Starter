<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

class WorkspaceTemplateFactory extends Factory
{
    protected $model = WorkspaceTemplate::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'workspace_id' => null,
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'icon' => $this->faker->randomElement(array_keys(WorkspaceTemplate::getAvailableIcons())),
            'is_public' => false,
            'category' => $this->faker->randomElement(array_keys(WorkspaceTemplate::getCategories())),
            'configuration' => [
                'settings' => [
                    'timezone' => 'UTC',
                    'date_format' => 'Y-m-d',
                    'language' => 'en',
                ],
                'features' => [
                    'two_factor_required' => false,
                    'allowed_email_domains' => null,
                ],
                'webhooks_structure' => [],
                'api_keys_structure' => ['scopes' => ['read', 'write']],
                'default_roles' => [
                    'admin_permissions' => ['manage_team', 'manage_billing'],
                    'member_permissions' => [],
                ],
                'custom_fields' => [],
            ],
            'usage_count' => 0,
        ];
    }

    public function public(): self
    {
        return $this->state(fn (array $attributes) => [
            'is_public' => true,
        ]);
    }

    public function fromWorkspace(Workspace $workspace): self
    {
        return $this->state(fn (array $attributes) => [
            'workspace_id' => $workspace->id,
            'user_id' => $workspace->owner_id,
        ]);
    }

    public function category(string $category): self
    {
        return $this->state(fn (array $attributes) => [
            'category' => $category,
        ]);
    }

    public function forUser(int $userId): self
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $userId,
        ]);
    }
}
