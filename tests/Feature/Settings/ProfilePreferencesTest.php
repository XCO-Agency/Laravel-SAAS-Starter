<?php

use App\Models\User;

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get('/settings/profile');

    $response->assertOk();
});

test('profile information can be updated with timezone and date format', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'timezone' => 'America/New_York',
            'date_format' => 'd/m/Y',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/settings/profile');

    $user->refresh();

    expect($user->name)->toBe('Test User')
        ->and($user->email)->toBe('test@example.com')
        ->and($user->timezone)->toBe('America/New_York')
        ->and($user->date_format)->toBe('d/m/Y');
});

test('invalid date formats are rejected', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'timezone' => 'America/New_York',
            'date_format' => 'invalid-format',
        ]);

    $response->assertSessionHasErrors('date_format');
});
