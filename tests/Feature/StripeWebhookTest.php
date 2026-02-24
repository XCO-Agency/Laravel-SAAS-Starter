<?php

use App\Models\Workspace;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Support\Facades\Log;
use Laravel\Cashier\Http\Middleware\VerifyWebhookSignature;

uses(WithoutMiddleware::class); // Bypass signature validation for the test

beforeEach(function () {
    // Only exclude VerifyWebhookSignature, otherwise other middleware might be needed,
    // though Cashier webhooks normally don't use much middleware.
    $this->withoutMiddleware([VerifyWebhookSignature::class]);
});

it('handles customer subscription created event and logs workspace data', function () {
    $this->withoutExceptionHandling();

    // 1. Setup a workspace with a specific stripe_id
    $workspace = Workspace::factory()->create([
        'stripe_id' => 'cus_test123',
    ]);

    // 2. Mock the Log facade
    Log::shouldReceive('info')
        ->once()
        ->with('Subscription created for workspace', \Mockery::on(function ($context) use ($workspace) {
            return $context['workspace_id'] === $workspace->id
                && $context['workspace_name'] === $workspace->name
                && $context['stripe_subscription_id'] === 'sub_test123'
                && $context['stripe_price'] === 'price_test123';
        }));
    Log::shouldReceive('error')->zeroOrMoreTimes();
    Log::shouldReceive('warning')->zeroOrMoreTimes();

    // 3. Send the webhook payload matching Stripe's structure
    $response = $this->postJson('/stripe/webhook', [
        'type' => 'customer.subscription.created',
        'id' => 'evt_123',
        'data' => [
            'object' => [
                'id' => 'sub_test123',
                'customer' => 'cus_test123',
                'status' => 'active',
                'items' => [
                    'data' => [
                        [
                            'id' => 'si_test123',
                            'price' => [
                                'id' => 'price_test123',
                                'product' => 'prod_test123',
                            ],
                            'quantity' => 1,
                        ],
                    ],
                ],
            ],
        ],
    ]);

    $response->assertSuccessful();
});

it('handles customer subscription updated event and logs workspace data', function () {
    $this->withoutExceptionHandling();

    $workspace = Workspace::factory()->create([
        'stripe_id' => 'cus_test456',
    ]);

    Log::shouldReceive('info')
        ->once()
        ->with('Subscription updated for workspace', \Mockery::on(function ($context) use ($workspace) {
            return $context['workspace_id'] === $workspace->id
                && $context['workspace_name'] === $workspace->name
                && $context['status'] === 'active';
        }));
    Log::shouldReceive('error')->zeroOrMoreTimes();
    Log::shouldReceive('warning')->zeroOrMoreTimes();

    $response = $this->postJson('/stripe/webhook', [
        'type' => 'customer.subscription.updated',
        'id' => 'evt_456',
        'data' => [
            'object' => [
                'id' => 'sub_test456',
                'customer' => 'cus_test456',
                'status' => 'active',
                'items' => [
                    'data' => [
                        [
                            'id' => 'si_test456',
                            'price' => [
                                'id' => 'price_test456',
                                'product' => 'prod_test456',
                            ],
                            'quantity' => 1,
                        ],
                    ],
                ],
            ],
        ],
    ]);

    $response->assertSuccessful();
});

it('handles customer subscription deleted event and logs workspace data', function () {
    $workspace = Workspace::factory()->create([
        'stripe_id' => 'cus_test789',
    ]);

    Log::shouldReceive('info')
        ->once()
        ->with('Subscription cancelled for workspace', \Mockery::on(function ($context) use ($workspace) {
            return $context['workspace_id'] === $workspace->id
                && $context['workspace_name'] === $workspace->name;
        }));

    $response = $this->postJson('/stripe/webhook', [
        'type' => 'customer.subscription.deleted',
        'id' => 'evt_789',
        'data' => [
            'object' => [
                'id' => 'sub_test789',
                'customer' => 'cus_test789',
            ],
        ],
    ]);

    $response->assertSuccessful();
});
