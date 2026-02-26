<?php

namespace Database\Factories;

use App\Models\FeatureFlag;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\FeatureFlag>
 */
class FeatureFlagFactory extends Factory
{
    protected $model = FeatureFlag::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'key' => 'feature-'.fake()->unique()->slug(1),
            'name' => fake()->words(2, true),
            'description' => fake()->sentence(),
            'is_global' => false,
            'workspace_ids' => [],
        ];
    }

    /**
     * Mark the flag as global.
     */
    public function global(): static
    {
        return $this->state(fn () => [
            'is_global' => true,
            'workspace_ids' => [],
        ]);
    }

    /**
     * Limit the flag to specific workspaces.
     */
    public function forWorkspaces(array $ids): static
    {
        return $this->state(fn () => [
            'is_global' => false,
            'workspace_ids' => $ids,
        ]);
    }
}
