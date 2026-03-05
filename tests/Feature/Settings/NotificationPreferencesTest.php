<?php

use App\Models\User;

it('renders the notification preferences page natively', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/settings/notifications')
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->has('notification_preferences.channels')
                ->has('notification_preferences.categories')
        );
});

it('updates and persists json notification preferences accurately', function () {
    $user = User::factory()->create([
        'notification_preferences' => [
            'channels' => [
                'email' => true,
                'in_app' => true,
            ],
            'categories' => [
                'marketing' => true,
                'security' => true,
                'team' => true,
                'billing' => true,
            ],
        ],
    ]);

    $response = $this->actingAs($user)->put('/settings/notifications', [
        'preferences' => [
            'channels' => [
                'email' => false,
                'in_app' => true,
            ],
            'categories' => [
                'marketing' => false,
                'security' => true,
                'team' => false,
                'billing' => false,
            ],
        ],
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $user->refresh();

    expect($user->notification_preferences)->toBeArray()
        ->and($user->notification_preferences['channels']['email'])->toBeFalse()
        ->and($user->notification_preferences['channels']['in_app'])->toBeTrue()
        ->and($user->notification_preferences['categories']['marketing'])->toBeFalse()
        ->and($user->notification_preferences['categories']['security'])->toBeTrue()
        ->and($user->notification_preferences['categories']['team'])->toBeFalse()
        ->and($user->notification_preferences['categories']['billing'])->toBeFalse();
});

it('normalizes legacy flat preferences into channels and categories', function () {
    $user = User::factory()->create([
        'notification_preferences' => [
            'marketing' => false,
            'security' => true,
            'team' => false,
            'billing' => true,
        ],
    ]);

    $this->actingAs($user)
        ->get('/settings/notifications')
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->where('notification_preferences.channels.email', true)
                ->where('notification_preferences.channels.in_app', true)
                ->where('notification_preferences.categories.marketing', false)
                ->where('notification_preferences.categories.security', true)
                ->where('notification_preferences.categories.team', false)
                ->where('notification_preferences.categories.billing', true)
        );
});
