<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Ticket>
 */
class TicketFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'workspace_id' => Workspace::factory(),
            'subject' => fake()->sentence(),
            'status' => fake()->randomElement(['open', 'in_progress', 'resolved', 'closed']),
            'priority' => fake()->randomElement(['low', 'normal', 'high', 'urgent']),
        ];
    }
}
