<?php

use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\Request;

it('transforms user into correct array structure', function () {
    $user = User::factory()->withoutTwoFactor()->create([
        'name' => 'John Doe',
        'email' => 'john@example.com',
    ]);

    $resource = (new UserResource($user))->toArray(new Request);

    expect($resource)
        ->toHaveKeys(['id', 'name', 'email'])
        ->and($resource['id'])->toBe($user->id)
        ->and($resource['name'])->toBe('John Doe')
        ->and($resource['email'])->toBe('john@example.com');
});

it('includes pivot role and joined_at when loaded from workspace', function () {
    $user = User::factory()->withoutTwoFactor()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user->id, ['role' => 'owner']);

    $userWithPivot = $workspace->users()->first();
    $resource = (new UserResource($userWithPivot))->toArray(new Request);

    expect($resource)
        ->toHaveKeys(['id', 'name', 'email', 'role', 'joined_at'])
        ->and($resource['role'])->toBe('owner');
});
