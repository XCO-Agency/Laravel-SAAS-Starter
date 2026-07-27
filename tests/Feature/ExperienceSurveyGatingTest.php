<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia;

it('does not show the survey for an account younger than the threshold', function () {
    $user = User::factory()->create([
        'created_at' => now()->subDay(),
        'experience_feedback_at' => null,
    ]);

    $this->actingAs($user)
        ->get('/notifications')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('show_experience_survey', false)
        );
});

it('shows the survey once the account is old enough and unanswered', function () {
    $user = User::factory()->create([
        'created_at' => now()->subDays(4),
        'experience_feedback_at' => null,
    ]);

    $this->actingAs($user)
        ->get('/notifications')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('show_experience_survey', true)
        );
});

it('does not show the survey once it has been answered or dismissed', function () {
    $user = User::factory()->create([
        'created_at' => now()->subDays(30),
        'experience_feedback_at' => now(),
    ]);

    $this->actingAs($user)
        ->get('/notifications')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('show_experience_survey', false)
        );
});

it('shares a falsey survey flag for unauthenticated visitors', function () {
    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('show_experience_survey', false)
        );
});
