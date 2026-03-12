<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Workspace>
 */
class WorkspaceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->company();

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::random(6),
            'owner_id' => User::factory(),
            'personal_workspace' => false,
        ];
    }

    /**
     * Indicate that the workspace is personal.
     */
    public function personal(): static
    {
        return $this->state(fn (array $attributes) => [
            'personal_workspace' => true,
        ]);
    }
}
