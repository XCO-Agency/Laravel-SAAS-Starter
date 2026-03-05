<?php

use App\Models\Feedback;
use App\Models\User;
use App\Models\Workspace;

it('belongs to a user', function () {
    $user = User::factory()->create();
    $feedback = Feedback::factory()->create(['user_id' => $user->id]);

    expect($feedback->user)->toBeInstanceOf(User::class);
    expect($feedback->user->id)->toBe($user->id);
});

it('belongs to a workspace', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $feedback = Feedback::factory()->create(['workspace_id' => $workspace->id]);

    expect($feedback->workspace)->toBeInstanceOf(Workspace::class);
    expect($feedback->workspace->id)->toBe($workspace->id);
});

it('casts metadata to array', function () {
    $feedback = Feedback::factory()->create([
        'metadata' => ['screen' => 'dashboard', 'resolution' => '1920x1080'],
    ]);

    expect($feedback->metadata)->toBeArray();
    expect($feedback->metadata['screen'])->toBe('dashboard');
});

it('has correct fillable attributes', function () {
    $feedback = new Feedback;
    expect($feedback->getFillable())->toContain(
        'user_id', 'workspace_id', 'type', 'message', 'status', 'page_url', 'user_agent', 'metadata'
    );
});
