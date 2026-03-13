<?php

use App\Models\LoginActivity;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->create(['is_superadmin' => true]);
});

it('allows superadmin to access cohort analysis page', function () {
    $this->actingAs($this->admin)
        ->get('/admin/cohort-analysis')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/cohort-analysis')
            ->has('cohorts')
        );
});

it('forbids non-admin access to cohort analysis', function () {
    $user = User::factory()->create(['is_superadmin' => false]);

    $this->actingAs($user)
        ->get('/admin/cohort-analysis')
        ->assertForbidden();
});

it('returns cohort data with the expected structure', function () {
    $this->actingAs($this->admin)
        ->get('/admin/cohort-analysis')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/cohort-analysis')
            ->has('cohorts', fn ($cohorts) => $cohorts
                ->each(fn ($cohort) => $cohort
                    ->has('month')
                    ->has('size')
                    ->has('retention')
                )
            )
        );
});

it('calculates 100% retention for month 0 in every cohort', function () {
    $this->actingAs($this->admin)
        ->get('/admin/cohort-analysis')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('cohorts', fn ($cohorts) => collect($cohorts)->every(
                fn ($cohort) => $cohort['retention'][0] === 100
            ))
        );
});

it('reflects actual login activity in retention calculation', function () {
    // Create a user who signed up 2 months ago
    $user = User::factory()->create([
        'created_at' => now()->subMonths(2)->startOfMonth()->addDays(5),
    ]);

    // Create a login activity in month 1 (1 month after signup)
    LoginActivity::factory()->create([
        'user_id' => $user->id,
        'is_successful' => true,
        'login_at' => now()->subMonths(1)->startOfMonth()->addDays(3),
    ]);

    $response = $this->actingAs($this->admin)
        ->get('/admin/cohort-analysis')
        ->assertOk();

    $cohorts = $response->original->getData()['page']['props']['cohorts'];

    // Find the cohort from 2 months ago
    $cohortMonth = now()->subMonths(2)->format('M Y');
    $cohort = collect($cohorts)->firstWhere('month', $cohortMonth);

    expect($cohort)->not->toBeNull()
        ->and($cohort['size'])->toBeGreaterThanOrEqual(1)
        ->and($cohort['retention'][1])->toBeGreaterThan(0);
});
