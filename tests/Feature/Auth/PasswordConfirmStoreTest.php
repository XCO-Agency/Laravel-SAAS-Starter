<?php

use App\Models\User;

use function Pest\Laravel\actingAs;

it('can confirm password with correct credentials', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->post('/user/confirm-password', [
            'password' => 'password',
        ])
        ->assertRedirect();
});

it('fails to confirm password with wrong credentials', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->post('/user/confirm-password', [
            'password' => 'wrong-password',
        ])
        ->assertSessionHasErrors();
});

it('returns confirmed password status when recently confirmed', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->getJson('/user/confirmed-password-status')
        ->assertOk()
        ->assertJson(['confirmed' => true]);
});

it('returns unconfirmed password status when not confirmed', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->getJson('/user/confirmed-password-status')
        ->assertOk()
        ->assertJson(['confirmed' => false]);
});

it('requires authentication for password confirmation', function () {
    $this->post('/user/confirm-password', [
        'password' => 'password',
    ])->assertRedirect(route('login'));
});
