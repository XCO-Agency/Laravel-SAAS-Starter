<?php

use App\Http\Requests\StoreInviteLinkRequest;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\Validator;

it('has the correct validation rules', function () {
    $request = new StoreInviteLinkRequest;
    $rules = $request->rules();

    expect($rules)->toHaveKeys(['role', 'max_uses', 'expires_in_days'])
        ->and($rules['role'])->toContain('required')
        ->and($rules['role'])->toContain('in:admin,member,viewer');
});

it('authorizes users who can manage team', function () {
    $user = User::factory()->withoutTwoFactor()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user->id, ['role' => 'owner']);
    $user->update(['current_workspace_id' => $workspace->id]);
    $user->load('currentWorkspace');

    $request = StoreInviteLinkRequest::create('/test', 'POST');
    $request->setUserResolver(fn () => $user);

    expect($request->authorize())->toBeTrue();
});

it('rejects users without team management permission', function () {
    $owner = User::factory()->withoutTwoFactor()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);

    $member = User::factory()->withoutTwoFactor()->create([
        'current_workspace_id' => $workspace->id,
    ]);
    $workspace->users()->attach($member->id, ['role' => 'member']);
    $member->load('currentWorkspace');

    $request = StoreInviteLinkRequest::create('/test', 'POST');
    $request->setUserResolver(fn () => $member);

    expect($request->authorize())->toBeFalse();
});

it('passes validation with valid data', function () {
    $request = new StoreInviteLinkRequest;
    $rules = $request->rules();

    $validator = Validator::make([
        'role' => 'admin',
        'max_uses' => 10,
        'expires_in_days' => 7,
    ], $rules);

    expect($validator->passes())->toBeTrue();
});

it('fails validation with invalid role', function () {
    $request = new StoreInviteLinkRequest;
    $rules = $request->rules();

    $validator = Validator::make([
        'role' => 'superadmin',
    ], $rules);

    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->has('role'))->toBeTrue();
});

it('fails validation when max_uses exceeds limit', function () {
    $request = new StoreInviteLinkRequest;
    $rules = $request->rules();

    $validator = Validator::make([
        'role' => 'member',
        'max_uses' => 1001,
    ], $rules);

    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->has('max_uses'))->toBeTrue();
});

it('fails validation when expires_in_days exceeds limit', function () {
    $request = new StoreInviteLinkRequest;
    $rules = $request->rules();

    $validator = Validator::make([
        'role' => 'member',
        'expires_in_days' => 91,
    ], $rules);

    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->has('expires_in_days'))->toBeTrue();
});
