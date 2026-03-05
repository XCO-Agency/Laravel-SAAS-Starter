<?php

use App\Models\User;
use App\Notifications\MagicLinkNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;

it('renders the magic link request page', function () {
    $response = $this->get('/magic-login');

    $response->assertStatus(200);
});

it('sends a magic link email to an existing user', function () {
    Notification::fake();

    $user = User::factory()->create();

    $response = $this->post('/magic-login', [
        'email' => $user->email,
    ]);

    $response->assertSessionHas('status', 'If an account with that email exists, we have sent a magic link.');

    Notification::assertSentTo(
        $user,
        MagicLinkNotification::class,
        function ($notification) use ($user) {
            return str_contains($notification->url, '/magic-login/' . $user->id);
        }
    );
});

it('returns success message even if email does not exist to prevent enumeration', function () {
    Notification::fake();

    $response = $this->post('/magic-login', [
        'email' => 'nonexistent@example.com',
    ]);

    $response->assertSessionHas('status', 'If an account with that email exists, we have sent a magic link.');

    Notification::assertNothingSent();
});

it('authenticates a user with a valid signed magic link', function () {
    $user = User::factory()->create();

    $url = URL::temporarySignedRoute(
        'magic-link.authenticate',
        now()->addMinutes(15),
        ['user' => $user->id]
    );

    $response = $this->get($url);

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect(route('dashboard'));
});

it('rejects an invalid or modified signed magic link', function () {
    $user = User::factory()->create();

    $url = URL::temporarySignedRoute(
        'magic-link.authenticate',
        now()->addMinutes(15),
        ['user' => $user->id]
    );

    // Tamper with the URL
    $modifiedUrl = $url . 'a';

    $response = $this->get($modifiedUrl);

    $response->assertStatus(403);
    $this->assertGuest();
});

it('rejects an expired magic link', function () {
    $user = User::factory()->create();

    // Generate a URL that expired 5 minutes ago
    $url = URL::temporarySignedRoute(
        'magic-link.authenticate',
        now()->subMinutes(5),
        ['user' => $user->id]
    );

    $response = $this->get($url);

    $response->assertStatus(403);
    $this->assertGuest();
});
