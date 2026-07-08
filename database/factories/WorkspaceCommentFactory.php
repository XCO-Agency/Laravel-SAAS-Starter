<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceComment;
use Illuminate\Database\Eloquent\Factories\Factory;

class WorkspaceCommentFactory extends Factory
{
    protected $model = WorkspaceComment::class;

    public function definition(): array
    {
        return [
            'workspace_id' => Workspace::factory(),
            'user_id' => User::factory(),
            'parent_id' => null,
            'commentable_type' => 'activity',
            'commentable_id' => $this->faker->randomNumber(),
            'content' => $this->faker->paragraph(),
        ];
    }

    public function reply(int $parentId): self
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => $parentId,
        ]);
    }

    public function forWorkspace(Workspace $workspace): self
    {
        return $this->state(fn (array $attributes) => [
            'workspace_id' => $workspace->id,
        ]);
    }

    public function resolved(): self
    {
        return $this->state(fn (array $attributes) => [
            'resolved_at' => now(),
        ]);
    }

    public function byUser(User $user): self
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
        ]);
    }
}
