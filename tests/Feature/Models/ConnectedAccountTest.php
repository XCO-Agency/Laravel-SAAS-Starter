<?php

use App\Models\ConnectedAccount;
use App\Models\User;

it('belongs to a user', function () {
    $user = User::factory()->create();
    $account = ConnectedAccount::create([
        'user_id' => $user->id,
        'provider' => 'github',
        'provider_id' => '12345',
    ]);

    expect($account->user)->toBeInstanceOf(User::class);
    expect($account->user->id)->toBe($user->id);
});

it('is unguarded', function () {
    $account = new ConnectedAccount([
        'user_id' => 1,
        'provider' => 'github',
        'provider_id' => '12345',
        'token' => 'abc123',
    ]);

    expect($account->provider)->toBe('github');
    expect($account->token)->toBe('abc123');
});
