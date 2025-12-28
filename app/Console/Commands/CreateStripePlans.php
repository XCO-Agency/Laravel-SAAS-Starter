<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Stripe\StripeClient;

class CreateStripePlans extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'stripe:create-plans {--force : Recreate products even if they exist}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create Stripe products and prices based on billing configuration';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $stripe = new StripeClient(config('services.stripe.secret'));

        $plans = config('billing.plans');
        $createdPrices = [];

        foreach ($plans as $planKey => $plan) {
            // Skip free plan
            if ($planKey === 'free') {
                $this->info('Skipping free plan (no Stripe product needed)');

                continue;
            }

            $this->info("\n📦 Creating product: {$plan['name']}");

            // Check if product already exists
            $existingProducts = $stripe->products->search([
                'query' => "metadata['plan_key']:'{$planKey}'",
            ]);

            $product = null;
            if ($existingProducts->data && ! $this->option('force')) {
                $product = $existingProducts->data[0];
                $this->warn("  Product already exists: {$product->id}");
            } else {
                // Create the product
                $product = $stripe->products->create([
                    'name' => $plan['name'],
                    'description' => $plan['description'],
                    'metadata' => [
                        'plan_key' => $planKey,
                    ],
                ]);
                $this->info("  ✅ Created product: {$product->id}");
            }

            // Create prices for this product
            foreach (['monthly', 'yearly'] as $interval) {
                $price = $plan['price'][$interval];
                if ($price <= 0) {
                    continue;
                }

                $intervalName = $interval === 'monthly' ? 'month' : 'year';
                $lookupKey = "{$planKey}_{$interval}";

                // Check if price already exists
                $existingPrices = $stripe->prices->search([
                    'query' => "lookup_key:'{$lookupKey}'",
                ]);

                if ($existingPrices->data && ! $this->option('force')) {
                    $existingPrice = $existingPrices->data[0];
                    $this->warn("  Price already exists ({$interval}): {$existingPrice->id}");
                    $createdPrices[$planKey][$interval] = $existingPrice->id;
                } else {
                    $newPrice = $stripe->prices->create([
                        'product' => $product->id,
                        'unit_amount' => $price * 100, // Convert to cents
                        'currency' => 'usd',
                        'recurring' => [
                            'interval' => $intervalName,
                        ],
                        'lookup_key' => $lookupKey,
                        'metadata' => [
                            'plan_key' => $planKey,
                            'billing_interval' => $interval,
                        ],
                    ]);
                    $this->info("  ✅ Created {$interval} price: {$newPrice->id} (\${$price}/{$intervalName})");
                    $createdPrices[$planKey][$interval] = $newPrice->id;
                }
            }
        }

        $this->newLine(2);
        $this->info('🎉 Stripe plans created successfully!');
        $this->newLine();
        $this->info('Add these to your .env file:');
        $this->newLine();

        foreach ($createdPrices as $planKey => $prices) {
            $planKeyUpper = strtoupper($planKey);
            if (isset($prices['monthly'])) {
                $this->line("STRIPE_{$planKeyUpper}_MONTHLY_PRICE_ID={$prices['monthly']}");
            }
            if (isset($prices['yearly'])) {
                $this->line("STRIPE_{$planKeyUpper}_YEARLY_PRICE_ID={$prices['yearly']}");
            }
        }

        return Command::SUCCESS;
    }
}
