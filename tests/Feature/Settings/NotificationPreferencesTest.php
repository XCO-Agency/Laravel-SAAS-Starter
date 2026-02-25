<?php

use App\Models\User;

it('renders the notification preferences page natively', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/settings/notifications');

    $response->assertStatus(200);
});

it('updates and persists json notification preferences accurately', function () {
    $user = User::factory()->create([
        'notification_preferences' => [
            'marketing' => true,
            'security' => true,
            'team' => true,
        ],
    ]);

    $response = $this->actingAs($user)->put('/settings/notifications', [
        'preferences' => [
            'marketing' => false,
            'security' => true,
            'team' => false,
        ],
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $user->refresh();

    expect($user->notification_preferences)->toBeArray()
        ->and($user->notification_preferences['marketing'])->toBeFalse()
        ->and($user->notification_preferences['security'])->toBeTrue()
        ->and($user->notification_preferences['team'])->toBeFalse();
});
