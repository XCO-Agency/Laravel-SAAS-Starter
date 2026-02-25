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
}
