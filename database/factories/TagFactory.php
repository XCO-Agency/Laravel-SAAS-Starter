<?php

namespace Database\Factories;

use App\Models\Tag;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TagFactory extends Factory
{
    protected $model = Tag::class;

    public function definition(): array
    {
        $name = $this->faker->word();

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'color' => $this->faker->randomElement(array_keys(Tag::getPresetColors())),
            'description' => $this->faker->sentence(),
            'workspace_id' => Workspace::factory(),
            'user_id' => User::factory(),
        ];
    }

    public function global(): self
    {
        return $this->state(fn (array $attributes) => [
            'workspace_id' => null,
        ]);
    }

    public function forWorkspace(Workspace $workspace): self
    {
        return $this->state(fn (array $attributes) => [
            'workspace_id' => $workspace->id,
        ]);
    }

    public function color(string $color): self
    {
        return $this->state(fn (array $attributes) => [
            'color' => $color,
        ]);
    }
}
