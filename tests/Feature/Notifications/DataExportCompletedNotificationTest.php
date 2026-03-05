<?php

use App\Models\User;
use App\Notifications\DataExportCompleted;

it('uses both mail and database channels when both channels are enabled', function () {
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

    $notification = new DataExportCompleted('https://example.com/download');

    expect($notification->via($user))->toBe(['mail', 'database']);
});

it('disables all channels when security category is disabled', function () {
    $user = User::factory()->create([
        'notification_preferences' => [
            'channels' => [
                'email' => true,
                'in_app' => true,
            ],
            'categories' => [
                'marketing' => true,
                'security' => false,
                'team' => true,
                'billing' => true,
            ],
        ],
    ]);

    $notification = new DataExportCompleted('https://example.com/download');

    expect($notification->via($user))->toBe([]);
});
