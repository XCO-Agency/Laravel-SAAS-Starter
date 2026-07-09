<?php

use App\Models\User;
use App\Notifications\TestNotification;
use Illuminate\Support\Facades\Notification;

it('requires authentication and sends nothing to guests', function () {
    Notification::fake();

    $this->post('/settings/notifications/test')
        ->assertRedirect('/login');

    Notification::assertNothingSent();
});

it('sends the test notification to the authenticated user only', function () {
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

it('delivers only through the email channel when only email is enabled', function () {
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

it('delivers only through the in-app channel when only in_app is enabled', function () {
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

it('fails with an error and sends nothing when both channels are disabled', function () {
    Notification::fake();

    $user = User::factory()->create([
        'notification_preferences' => [
            'channels' => ['email' => false, 'in_app' => false],
        ],
    ]);

    $this->actingAs($user)
        ->post('/settings/notifications/test')
        ->assertRedirect()
        ->assertSessionHas('error');

    Notification::assertNotSentTo($user, TestNotification::class);
});
