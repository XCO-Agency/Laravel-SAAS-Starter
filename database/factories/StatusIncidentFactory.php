<?php

namespace Database\Factories;

use App\Models\StatusIncident;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StatusIncident>
 */
class StatusIncidentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(4),
            'message' => $this->faker->paragraph(),
            'status' => $this->faker->randomElement(StatusIncident::STATUSES),
            'resolved_at' => null,
        ];
    }
}
