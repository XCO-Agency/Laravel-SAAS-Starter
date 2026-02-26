<?php

namespace Database\Factories;

use App\Models\WebhookEndpoint;
use App\Models\WebhookLog;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WebhookLog>
 */
class WebhookLogFactory extends Factory
{
    protected $model = WebhookLog::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'workspace_id' => Workspace::factory(),
            'webhook_endpoint_id' => WebhookEndpoint::factory(),
            'event_type' => 'test.event',
            'url' => fake()->url(),
            'status' => 200,
            'payload' => ['foo' => 'bar'],
            'response' => 'OK',
            'error' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
