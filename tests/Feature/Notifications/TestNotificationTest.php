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

it('sends a test notification to the authenticated user and flashes success', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/settings/notifications/test')
        ->assertRedirect()
        ->assertSessionHas('success');

    Notification::assertSentTo($user, TestNotification::class);
});

it('does not send and flashes an error when no channels are enabled', function () {
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

    Notification::assertNothingSent();
});

it('delivers through both channels when both are enabled', function () {
    $user = User::factory()->create([
        'notification_preferences' => [
            'channels' => ['email' => true, 'in_app' => true],
        ],
    ]);

    expect((new TestNotification)->via($user))->toBe(['mail', 'database']);
});

it('delivers only through the database channel when email is disabled', function () {
    $user = User::factory()->create([
        'notification_preferences' => [
            'channels' => ['email' => false, 'in_app' => true],
        ],
    ]);

    expect((new TestNotification)->via($user))->toBe(['database']);
});

it('delivers only through the mail channel when in-app is disabled', function () {
    $user = User::factory()->create([
        'notification_preferences' => [
            'channels' => ['email' => true, 'in_app' => false],
        ],
    ]);

    expect((new TestNotification)->via($user))->toBe(['mail']);
});

it('only notifies the acting user and no one else', function () {
    Notification::fake();

    $actingUser = User::factory()->create();
    $otherUser = User::factory()->create();

    $this->actingAs($actingUser)
        ->post('/settings/notifications/test')
        ->assertRedirect();

    Notification::assertSentTo($actingUser, TestNotification::class);
    Notification::assertNotSentTo($otherUser, TestNotification::class);
});
