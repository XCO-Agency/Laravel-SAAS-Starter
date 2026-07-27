<?php

namespace Database\Factories;

use App\Models\Feedback;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Feedback>
 */
class FeedbackFactory extends Factory
{
    protected $model = Feedback::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'type' => $this->faker->randomElement(['bug', 'idea', 'general']),
            'message' => $this->faker->sentence(20),
            'status' => $this->faker->randomElement(['new', 'reviewed', 'archived']),
        ];
    }

    /**
     * Indicate that the feedback is an experience-survey response.
     */
    public function experience(): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => 'experience',
            'message' => $this->faker->optional()->sentence(12),
            'metadata' => ['rating' => $this->faker->numberBetween(1, 5)],
        ]);
    }
}
