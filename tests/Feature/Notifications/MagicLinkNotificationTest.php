<?php

use App\Models\User;
use App\Notifications\MagicLinkNotification;
use Illuminate\Notifications\Messages\MailMessage;

it('sends via mail channel', function () {
    $notification = new MagicLinkNotification('https://example.com/magic-link');
    $channels = $notification->via(User::factory()->create());

    expect($channels)->toBe(['mail']);
});

it('builds correct mail message', function () {
    $url = 'https://example.com/magic-link/abc123';
    $notification = new MagicLinkNotification($url);
    $user = User::factory()->create();

    $mail = $notification->toMail($user);

    expect($mail)->toBeInstanceOf(MailMessage::class);
    expect($mail->subject)->toContain('Login to');
    expect($mail->actionUrl)->toBe($url);
});

it('stores the url property', function () {
    $url = 'https://example.com/magic-link/test';
    $notification = new MagicLinkNotification($url);

    expect($notification->url)->toBe($url);
});
