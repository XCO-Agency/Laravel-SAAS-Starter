<?php

namespace Database\Factories;

use App\Models\WebhookEndpoint;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WebhookEndpoint>
 */
class WebhookEndpointFactory extends Factory
{
    protected $model = WebhookEndpoint::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'workspace_id' => Workspace::factory(),
            'url' => fake()->url(),
            'secret' => \Illuminate\Support\Str::random(32),
            'events' => ['*'],
            'is_active' => true,
        ];
    }
}
