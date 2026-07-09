<?php

use App\Models\User;
use App\Notifications\TestNotification;
use Illuminate\Support\Facades\Notification;

it('rejects guests and sends nothing', function () {
    Notification::fake();

    $this->post('/settings/notifications/test')
        ->assertRedirect('/login');

    Notification::assertNothingSent();
});

it('sends a test notification to the authenticated user only', function () {
    Notification::fake();

    $user = User::factory()->create();
    $other = User::factory()->create();

    $this->actingAs($user)
        ->post('/settings/notifications/test')
        ->assertRedirect()
        ->assertSessionHas('success')
        ->assertSessionHasNoErrors();

    Notification::assertSentTo($user, TestNotification::class);
    Notification::assertNotSentTo($other, TestNotification::class);
});

it('delivers only through the mail channel when only email is enabled', function () {
    Notification::fake();

    $user = User::factory()->create([
        'notification_preferences' => [
            'channels' => ['email' => true, 'in_app' => false],
        ],
    ]);

    $this->actingAs($user)->post('/settings/notifications/test');

    Notification::assertSentTo(
        $user,
        TestNotification::class,
        fn ($notification, $channels) => $channels === ['mail'],
    );
});

it('delivers only through the database channel when only in-app is enabled', function () {
    Notification::fake();

    $user = User::factory()->create([
        'notification_preferences' => [
            'channels' => ['email' => false, 'in_app' => true],
        ],
    ]);

    $this->actingAs($user)->post('/settings/notifications/test');

    Notification::assertSentTo(
        $user,
        TestNotification::class,
        fn ($notification, $channels) => $channels === ['database'],
    );
});

it('delivers through no channels when both are disabled but still succeeds', function () {
    Notification::fake();

    $user = User::factory()->create([
        'notification_preferences' => [
            'channels' => ['email' => false, 'in_app' => false],
        ],
    ]);

    $this->actingAs($user)
        ->post('/settings/notifications/test')
        ->assertRedirect()
        ->assertSessionHas('success');

    Notification::assertSentTo(
        $user,
        TestNotification::class,
        fn ($notification, $channels) => $channels === [],
    );
});
