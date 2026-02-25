<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WorkspaceApiKey>
 */
class WorkspaceApiKeyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $plainText = 'wsk_'.Str::random(40);

        return [
            'workspace_id' => Workspace::factory(),
            'created_by' => User::factory(),
            'name' => $this->faker->words(2, true).' key',
            'key_hash' => hash('sha256', $plainText),
            'key_prefix' => substr($plainText, 0, 8),
            'scopes' => ['read', 'write'],
            'last_used_at' => null,
            'expires_at' => null,
        ];
    }

    /**
     * Mark the key as expired.
     */
    public function expired(): static
    {
        return $this->state(fn () => [
            'expires_at' => now()->subDay(),
        ]);
    }
}
