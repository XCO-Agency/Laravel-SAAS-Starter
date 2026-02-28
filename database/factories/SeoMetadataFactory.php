<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SeoMetadata>
 */
class SeoMetadataFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'path' => '/'.fake()->unique()->slug(2),
            'title' => fake()->sentence(4),
            'description' => fake()->sentence(12),
            'keywords' => implode(', ', fake()->words(5)),
            'og_title' => fake()->sentence(4),
            'og_description' => fake()->sentence(10),
            'og_image' => null,
            'og_type' => 'website',
            'twitter_card' => 'summary_large_image',
            'twitter_site' => null,
            'twitter_creator' => null,
            'twitter_image' => null,
            'is_global' => false,
        ];
    }

    /**
     * Mark this entry as the global fallback.
     */
    public function global(): static
    {
        return $this->state(fn () => [
            'path' => null,
            'is_global' => true,
        ]);
    }
}
