<?php

use App\Models\PasswordHistory;
use App\Models\User;
use Illuminate\Support\Carbon;

it('belongs to a user', function () {
    $user = User::factory()->create();

    $history = PasswordHistory::create([
        'user_id' => $user->id,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'PHPUnit',
        'changed_at' => now(),
    ]);

    expect($history->user)->toBeInstanceOf(User::class);
    expect($history->user->id)->toBe($user->id);
});

it('casts changed_at to datetime', function () {
    $user = User::factory()->create();

    $history = PasswordHistory::create([
        'user_id' => $user->id,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'PHPUnit',
        'changed_at' => '2025-06-15 12:00:00',
    ]);

    expect($history->changed_at)->toBeInstanceOf(Carbon::class);
});

it('has correct fillable attributes', function () {
    $history = new PasswordHistory;
    expect($history->getFillable())->toContain('user_id', 'ip_address', 'user_agent', 'changed_at');
});
