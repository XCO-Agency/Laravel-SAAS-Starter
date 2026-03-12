<?php

namespace Database\Factories;

use App\Models\ApiRequestLog;
use App\Models\Workspace;
use App\Models\WorkspaceApiKey;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ApiRequestLog>
 */
class ApiRequestLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'workspace_id' => Workspace::factory(),
            'api_key_id' => WorkspaceApiKey::factory(),
            'method' => fake()->randomElement(['GET', 'POST', 'PUT', 'DELETE']),
            'path' => '/api/v1/'.fake()->randomElement(['workspace', 'members']),
            'status_code' => fake()->randomElement([200, 200, 200, 201, 400, 401, 403, 429, 500]),
            'response_time_ms' => fake()->numberBetween(10, 500),
            'was_throttled' => false,
            'ip_address' => fake()->ipv4(),
            'requested_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }

    /**
     * Indicate that the request was throttled.
     */
    public function throttled(): static
    {
        return $this->state(fn (array $attributes) => [
            'was_throttled' => true,
            'status_code' => 429,
        ]);
    }
}
