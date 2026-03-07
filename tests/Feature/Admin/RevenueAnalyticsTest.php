<?php

use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->admin = User::factory()->create(['is_superadmin' => true]);
});

it('displays revenue analytics page for superadmins', function () {
    $this->actingAs($this->admin)
        ->get('/admin/revenue-analytics')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/revenue-analytics')
            ->has('summary')
            ->has('mrr')
            ->has('churnRate')
            ->has('trialConversionRate')
            ->has('planDistribution')
            ->has('monthlySubscriptions')
            ->has('dailyNewSubs')
            ->has('revenueByPlan')
        );
});

it('prevents non-admin access', function () {
    $user = User::factory()->create(['is_superadmin' => false]);

    $this->actingAs($user)
        ->get('/admin/revenue-analytics')
        ->assertForbidden();
});

it('shows correct subscription summary counts', function () {
    $workspace1 = Workspace::factory()->create();
    $workspace2 = Workspace::factory()->create();
    $workspace3 = Workspace::factory()->create();

    $workspace1->subscriptions()->create([
        'type' => 'default',
        'stripe_id' => 'sub_active_'.uniqid(),
        'stripe_status' => 'active',
        'stripe_price' => 'price_pro_monthly',
    ]);

    $workspace2->subscriptions()->create([
        'type' => 'default',
        'stripe_id' => 'sub_trialing_'.uniqid(),
        'stripe_status' => 'trialing',
        'stripe_price' => 'price_pro_monthly',
        'trial_ends_at' => now()->addDays(7),
    ]);

    $workspace3->subscriptions()->create([
        'type' => 'default',
        'stripe_id' => 'sub_canceled_'.uniqid(),
        'stripe_status' => 'canceled',
        'stripe_price' => 'price_pro_monthly',
    ]);

    $this->actingAs($this->admin)
        ->get('/admin/revenue-analytics')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('summary.total_active', 1)
            ->where('summary.total_trialing', 1)
            ->where('summary.total_canceled', 1)
        );
});

it('calculates estimated MRR from active subscriptions', function () {
    $workspace = Workspace::factory()->create();

    $workspace->subscriptions()->create([
        'type' => 'default',
        'stripe_id' => 'sub_mrr_'.uniqid(),
        'stripe_status' => 'active',
        'stripe_price' => config('billing.plans.pro.stripe_price_id.monthly'),
    ]);

    $this->actingAs($this->admin)
        ->get('/admin/revenue-analytics')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('mrr', config('billing.plans.pro.price.monthly'))
        );
});

it('shows plan distribution for active subscriptions', function () {
    $workspace = Workspace::factory()->create();

    $workspace->subscriptions()->create([
        'type' => 'default',
        'stripe_id' => 'sub_dist_'.uniqid(),
        'stripe_status' => 'active',
        'stripe_price' => config('billing.plans.pro.stripe_price_id.monthly'),
    ]);

    $this->actingAs($this->admin)
        ->get('/admin/revenue-analytics')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('planDistribution', 1)
            ->where('planDistribution.0.count', 1)
        );
});

it('calculates churn rate from canceled subscriptions', function () {
    $workspace1 = Workspace::factory()->create();
    $workspace2 = Workspace::factory()->create();

    // One active sub created 60 days ago (counts as base)
    $workspace1->subscriptions()->create([
        'type' => 'default',
        'stripe_id' => 'sub_churn_active_'.uniqid(),
        'stripe_status' => 'active',
        'stripe_price' => 'price_pro_monthly',
        'created_at' => now()->subDays(60),
    ]);

    // One canceled recently (counts as churned)
    $workspace2->subscriptions()->create([
        'type' => 'default',
        'stripe_id' => 'sub_churn_cancel_'.uniqid(),
        'stripe_status' => 'canceled',
        'stripe_price' => 'price_pro_monthly',
        'created_at' => now()->subDays(60),
        'updated_at' => now()->subDays(5),
    ]);

    $this->actingAs($this->admin)
        ->get('/admin/revenue-analytics')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('churnRate', 50) // 1 canceled / (1 active + 1 canceled) = 50%
        );
});

it('calculates trial conversion rate', function () {
    $workspace1 = Workspace::factory()->create();
    $workspace2 = Workspace::factory()->create();

    // Converted trial (trial ended, now active)
    $workspace1->subscriptions()->create([
        'type' => 'default',
        'stripe_id' => 'sub_trial_converted_'.uniqid(),
        'stripe_status' => 'active',
        'stripe_price' => 'price_pro_monthly',
        'trial_ends_at' => now()->subDays(5),
    ]);

    // Still trialing (not yet converted)
    $workspace2->subscriptions()->create([
        'type' => 'default',
        'stripe_id' => 'sub_trial_active_'.uniqid(),
        'stripe_status' => 'trialing',
        'stripe_price' => 'price_pro_monthly',
        'trial_ends_at' => now()->addDays(5),
    ]);

    $this->actingAs($this->admin)
        ->get('/admin/revenue-analytics')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('trialConversionRate', 50) // 1 converted / 2 total trials
        );
});

it('returns daily new subscriptions for last 30 days', function () {
    $this->actingAs($this->admin)
        ->get('/admin/revenue-analytics')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('dailyNewSubs', 30)
        );
});

it('returns monthly subscription flow for last 6 months', function () {
    $this->actingAs($this->admin)
        ->get('/admin/revenue-analytics')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('monthlySubscriptions', 6)
            ->where('monthlySubscriptions.0.new', 0)
            ->where('monthlySubscriptions.0.canceled', 0)
        );
});

it('shows revenue breakdown by plan', function () {
    $this->actingAs($this->admin)
        ->get('/admin/revenue-analytics')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('revenueByPlan', 2) // pro + business from config
        );
});

it('counts workspaces on trial', function () {
    Workspace::factory()->create([
        'trial_ends_at' => now()->addDays(5),
    ]);

    Workspace::factory()->create([
        'trial_ends_at' => now()->subDays(1), // expired
    ]);

    $this->actingAs($this->admin)
        ->get('/admin/revenue-analytics')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('summary.workspaces_on_trial', 1)
        );
});

it('handles no subscriptions gracefully', function () {
    $this->actingAs($this->admin)
        ->get('/admin/revenue-analytics')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('summary.total_active', 0)
            ->where('summary.total_trialing', 0)
            ->where('summary.total_canceled', 0)
            ->where('mrr', 0)
            ->where('churnRate', 0)
            ->where('trialConversionRate', 0)
        );
});
