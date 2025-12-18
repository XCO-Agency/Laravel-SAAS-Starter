<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Subscription Plans
    |--------------------------------------------------------------------------
    |
    | Define your subscription plans here. Each plan should have a unique key,
    | a display name, price information, and feature limits.
    |
    | Note: The 'stripe_price_id' values should be replaced with your actual
    | Stripe Price IDs from your Stripe Dashboard.
    |
    */

    'plans' => [
        'free' => [
            'name' => 'Free',
            'description' => 'Perfect for getting started',
            'price' => [
                'monthly' => 0,
                'yearly' => 0,
            ],
            'stripe_price_id' => [
                'monthly' => null, // No Stripe price for free plan
                'yearly' => null,
            ],
            'limits' => [
                'workspaces' => 1,
                'team_members' => 2,
            ],
            'features' => [
                '1 Workspace',
                '2 Team Members',
                'Basic Features',
                'Community Support',
            ],
        ],

        'pro' => [
            'name' => 'Pro',
            'description' => 'For growing teams',
            'price' => [
                'monthly' => 19,
                'yearly' => 190, // ~2 months free
            ],
            'stripe_price_id' => [
                'monthly' => env('STRIPE_PRO_MONTHLY_PRICE_ID', 'price_pro_monthly'),
                'yearly' => env('STRIPE_PRO_YEARLY_PRICE_ID', 'price_pro_yearly'),
            ],
            'limits' => [
                'workspaces' => 5,
                'team_members' => 10,
            ],
            'features' => [
                '5 Workspaces',
                '10 Team Members',
                'All Features',
                'Priority Support',
                'Advanced Analytics',
            ],
            'popular' => true,
        ],

        'business' => [
            'name' => 'Business',
            'description' => 'For larger organizations',
            'price' => [
                'monthly' => 49,
                'yearly' => 490, // ~2 months free
            ],
            'stripe_price_id' => [
                'monthly' => env('STRIPE_BUSINESS_MONTHLY_PRICE_ID', 'price_business_monthly'),
                'yearly' => env('STRIPE_BUSINESS_YEARLY_PRICE_ID', 'price_business_yearly'),
            ],
            'limits' => [
                'workspaces' => -1, // Unlimited
                'team_members' => -1, // Unlimited
            ],
            'features' => [
                'Unlimited Workspaces',
                'Unlimited Team Members',
                'All Features',
                'Dedicated Support',
                'Advanced Analytics',
                'Custom Integrations',
                'SSO (Coming Soon)',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Trial Period
    |--------------------------------------------------------------------------
    |
    | The number of days to offer as a trial period for new subscriptions.
    | Set to 0 to disable trials.
    |
    */

    'trial_days' => 14,

    /*
    |--------------------------------------------------------------------------
    | Stripe Webhook Secret
    |--------------------------------------------------------------------------
    |
    | The webhook secret is used to verify that incoming webhooks are
    | actually from Stripe. Get this from your Stripe Dashboard.
    |
    */

    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),

];





