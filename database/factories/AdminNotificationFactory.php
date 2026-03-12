<?php

namespace Database\Factories;

use App\Models\AdminNotification;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AdminNotification>
 */
class AdminNotificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'type' => fake()->randomElement([
                AdminNotification::TYPE_WEBHOOK_FAILURE,
                AdminNotification::TYPE_SUBSCRIPTION_CANCELED,
                AdminNotification::TYPE_SUBSCRIPTION_PAST_DUE,
                AdminNotification::TYPE_SYSTEM_ERROR,
                AdminNotification::TYPE_NEW_SIGNUP,
            ]),
            'severity' => fake()->randomElement([
                AdminNotification::SEVERITY_INFO,
                AdminNotification::SEVERITY_WARNING,
                AdminNotification::SEVERITY_CRITICAL,
            ]),
            'title' => fake()->sentence(4),
            'message' => fake()->paragraph(),
            'metadata' => null,
            'read_at' => null,
        ];
    }

    /**
     * Mark as read.
     */
    public function read(): static
    {
        return $this->state(fn () => [
            'read_at' => now(),
        ]);
    }

    /**
     * Set as critical severity.
     */
    public function critical(): static
    {
        return $this->state(fn () => [
            'severity' => AdminNotification::SEVERITY_CRITICAL,
        ]);
    }

    /**
     * Set as warning severity.
     */
    public function warning(): static
    {
        return $this->state(fn () => [
            'severity' => AdminNotification::SEVERITY_WARNING,
        ]);
    }

    /**
     * Set as webhook failure type.
     */
    public function webhookFailure(): static
    {
        return $this->state(fn () => [
            'type' => AdminNotification::TYPE_WEBHOOK_FAILURE,
            'severity' => AdminNotification::SEVERITY_WARNING,
            'title' => 'Webhook delivery failed',
        ]);
    }

    /**
     * Set as subscription canceled type.
     */
    public function subscriptionCanceled(): static
    {
        return $this->state(fn () => [
            'type' => AdminNotification::TYPE_SUBSCRIPTION_CANCELED,
            'severity' => AdminNotification::SEVERITY_WARNING,
            'title' => 'Subscription canceled',
        ]);
    }
}
