<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInviteLink;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<WorkspaceInviteLink>
 */
class WorkspaceInviteLinkFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'workspace_id' => Workspace::factory(),
            'created_by' => User::factory(),
            'token' => Str::random(64),
            'role' => 'member',
            'max_uses' => null,
            'uses_count' => 0,
            'expires_at' => null,
        ];
    }

    /**
     * Set the link to expire in the future.
     */
    public function expiresInDays(int $days): static
    {
        return $this->state(fn () => [
            'expires_at' => now()->addDays($days),
        ]);
    }

    /**
     * Set the link as already expired.
     */
    public function expired(): static
    {
        return $this->state(fn () => [
            'expires_at' => now()->subDay(),
        ]);
    }

    /**
     * Set the link with a maximum number of uses.
     */
    public function withMaxUses(int $maxUses): static
    {
        return $this->state(fn () => [
            'max_uses' => $maxUses,
        ]);
    }

    /**
     * Set the link as fully used (exhausted).
     */
    public function exhausted(): static
    {
        return $this->state(fn () => [
            'max_uses' => 5,
            'uses_count' => 5,
        ]);
    }
}
