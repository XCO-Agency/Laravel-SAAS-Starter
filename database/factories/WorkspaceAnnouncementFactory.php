<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceAnnouncement;
use Illuminate\Database\Eloquent\Factories\Factory;

class WorkspaceAnnouncementFactory extends Factory
{
    protected $model = WorkspaceAnnouncement::class;

    public function definition(): array
    {
        return [
            'workspace_id' => Workspace::factory(),
            'user_id' => User::factory(),
            'title' => $this->faker->sentence(),
            'content' => $this->faker->paragraphs(3, true),
            'type' => $this->faker->randomElement(['info', 'warning', 'success']),
            'pinned' => false,
            'dismissible' => true,
            'published_at' => null,
            'expires_at' => null,
        ];
    }

    public function pinned(): self
    {
        return $this->state(fn (array $attributes) => [
            'pinned' => true,
        ]);
    }

    public function expired(): self
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => now()->subDay(),
        ]);
    }

    public function scheduled(): self
    {
        return $this->state(fn (array $attributes) => [
            'published_at' => now()->addDay(),
        ]);
    }

    public function forWorkspace(Workspace $workspace): self
    {
        return $this->state(fn (array $attributes) => [
            'workspace_id' => $workspace->id,
        ]);
    }

    public function byUser(User $user): self
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
        ]);
    }

    public function type(string $type): self
    {
        return $this->state(fn (array $attributes) => [
            'type' => $type,
        ]);
    }
}
