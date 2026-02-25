<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ChangelogEntry>
 */
class ChangelogEntryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'version' => $this->faker->numerify('#.#.#'),
            'title' => $this->faker->sentence(4),
            'body' => $this->faker->paragraphs(2, true),
            'type' => $this->faker->randomElement(['feature', 'improvement', 'fix']),
            'is_published' => true,
            'published_at' => $this->faker->dateTimeBetween('-6 months', 'now'),
        ];
    }

    /**
     * Draft state (unpublished).
     */
    public function draft(): static
    {
        return $this->state(fn () => [
            'is_published' => false,
            'published_at' => null,
        ]);
    }
}
