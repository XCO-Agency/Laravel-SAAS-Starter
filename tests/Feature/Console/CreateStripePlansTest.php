<?php

use Stripe\Collection;
use Stripe\Price;
use Stripe\Product;
use Stripe\Service\PriceService;
use Stripe\Service\ProductService;
use Stripe\StripeClient;

use function Pest\Laravel\artisan;

it('creates stripe products and prices', function () {
    // 1. Setup Mocks
    $stripeMock = Mockery::mock(StripeClient::class);
    $productServiceMock = Mockery::mock(ProductService::class);
    $priceServiceMock = Mockery::mock(PriceService::class);

    $stripeMock->products = $productServiceMock;
    $stripeMock->prices = $priceServiceMock;

    // Use app()->instance to inject the mock
    app()->instance(StripeClient::class, $stripeMock);

    $plans = config('billing.plans');
    $paidPlans = collect($plans)->filter(fn ($p, $k) => $k !== 'free');

    foreach ($paidPlans as $planKey => $plan) {
        // Mock product search (return empty)
        $productServiceMock->shouldReceive('search')
            ->once()
            ->with(['query' => "metadata['plan_key']:'{$planKey}'"])
            ->andReturn(new Collection);

        // Mock product creation
        $productServiceMock->shouldReceive('create')
            ->once()
            ->with([
                'name' => $plan['name'],
                'description' => $plan['description'],
                'metadata' => ['plan_key' => $planKey],
            ])
            ->andReturn(new Product(['id' => "prod_{$planKey}"]));

        foreach (['monthly', 'yearly'] as $interval) {
            $price = $plan['price'][$interval];
            if ($price <= 0) {
                continue;
            }

            $lookupKey = "{$planKey}_{$interval}";

            // Mock price search (return empty)
            $priceServiceMock->shouldReceive('search')
                ->once()
                ->with(['query' => "lookup_key:'{$lookupKey}'"])
                ->andReturn(new Collection);

            // Mock price creation
            $priceServiceMock->shouldReceive('create')
                ->once()
                ->with([
                    'product' => "prod_{$planKey}",
                    'unit_amount' => $price * 100,
                    'currency' => 'usd',
                    'recurring' => ['interval' => $interval === 'monthly' ? 'month' : 'year'],
                    'lookup_key' => $lookupKey,
                    'metadata' => [
                        'plan_key' => $planKey,
                        'billing_interval' => $interval,
                    ],
                ])
                ->andReturn(new Price(['id' => "price_{$lookupKey}"]));
        }
    }

    artisan('stripe:create-plans')
        ->expectsOutputToContain('Stripe plans created successfully!')
        ->assertSuccessful();
});

it('skips creation if products and prices already exist', function () {
    $stripeMock = Mockery::mock(StripeClient::class);
    $productServiceMock = Mockery::mock(ProductService::class);
    $priceServiceMock = Mockery::mock(PriceService::class);

    $stripeMock->products = $productServiceMock;
    $stripeMock->prices = $priceServiceMock;

    app()->instance(StripeClient::class, $stripeMock);

    $plans = config('billing.plans');
    $planKey = 'pro'; // Test with one plan
    $plan = $plans[$planKey];

    // Mock existing product
    $product = new Product(['id' => 'prod_existing']);
    $productCollection = \Stripe\SearchResult::constructFrom([
        'object' => 'search_result',
        'data' => [$product],
    ]);

    $productServiceMock->shouldReceive('search')
        ->andReturn($productCollection);

    // Should NOT call create
    $productServiceMock->shouldNotReceive('create');

    // Mock existing price
    $price = new Price(['id' => 'price_existing']);
    $priceCollection = \Stripe\SearchResult::constructFrom([
        'object' => 'search_result',
        'data' => [$price],
    ]);

    $priceServiceMock->shouldReceive('search')
        ->andReturn($priceCollection);

    // Should NOT call create
    $priceServiceMock->shouldNotReceive('create');

    artisan('stripe:create-plans')
        ->expectsOutputToContain('Product already exists')
        ->expectsOutputToContain('Price already exists')
        ->assertSuccessful();
});
