<?php

use App\Http\Middleware\RequireTwoFactor;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    // Register a named route so redirect()->route() doesn't fail
    Route::get('/workspace/2fa-required', fn () => 'required')->name('workspace.2fa-required');
});

it('passes through when no user is authenticated', function () {
    $middleware = new RequireTwoFactor;
    $request = Request::create('/test');
    $request->setUserResolver(fn () => null);

    $response = $middleware->handle($request, fn () => response('ok'));

    expect($response->getContent())->toBe('ok');
});

it('passes through when user has no current workspace', function () {
    $user = User::factory()->withoutTwoFactor()->create(['current_workspace_id' => null]);

    $middleware = new RequireTwoFactor;
    $request = Request::create('/test');
    $request->setUserResolver(fn () => $user);

    $response = $middleware->handle($request, fn () => response('ok'));

    expect($response->getContent())->toBe('ok');
});

it('passes through when workspace does not require 2FA', function () {
    $user = User::factory()->withoutTwoFactor()->create();
    $workspace = Workspace::factory()->create([
        'owner_id' => $user->id,
        'require_two_factor' => false,
    ]);
    $user->update(['current_workspace_id' => $workspace->id]);
    $user->load('currentWorkspace');

    $middleware = new RequireTwoFactor;
    $request = Request::create('/test');
    $request->setUserResolver(fn () => $user);

    $response = $middleware->handle($request, fn () => response('ok'));

    expect($response->getContent())->toBe('ok');
});

it('exempts workspace owners even without 2FA', function () {
    $user = User::factory()->withoutTwoFactor()->create();
    $workspace = Workspace::factory()->create([
        'owner_id' => $user->id,
        'require_two_factor' => true,
    ]);
    $user->update(['current_workspace_id' => $workspace->id]);
    $user->load('currentWorkspace');

    $middleware = new RequireTwoFactor;
    $request = Request::create('/test');
    $request->setUserResolver(fn () => $user);

    $response = $middleware->handle($request, fn () => response('ok'));

    expect($response->getContent())->toBe('ok');
});

it('redirects members without 2FA when workspace requires it', function () {
    $owner = User::factory()->withoutTwoFactor()->create();
    $workspace = Workspace::factory()->create([
        'owner_id' => $owner->id,
        'require_two_factor' => true,
    ]);

    $member = User::factory()->withoutTwoFactor()->create([
        'current_workspace_id' => $workspace->id,
    ]);
    $workspace->users()->attach($member->id, ['role' => 'member']);
    $member->load('currentWorkspace');

    $middleware = new RequireTwoFactor;
    $request = Request::create('/dashboard');
    $request->setUserResolver(fn () => $member);

    $response = $middleware->handle($request, fn () => response('ok'));

    expect($response->getStatusCode())->toBe(302)
        ->and($response->headers->get('Location'))->toContain('2fa-required');
});

it('allows members with 2FA enabled', function () {
    $owner = User::factory()->withoutTwoFactor()->create();
    $workspace = Workspace::factory()->create([
        'owner_id' => $owner->id,
        'require_two_factor' => true,
    ]);

    $member = User::factory()->create([
        'current_workspace_id' => $workspace->id,
        'two_factor_secret' => encrypt('secret'),
        'two_factor_confirmed_at' => now(),
    ]);
    $workspace->users()->attach($member->id, ['role' => 'member']);
    $member->load('currentWorkspace');

    $middleware = new RequireTwoFactor;
    $request = Request::create('/dashboard');
    $request->setUserResolver(fn () => $member);

    $response = $middleware->handle($request, fn () => response('ok'));

    expect($response->getContent())->toBe('ok');
});

it('allows 2FA setup routes for members without 2FA', function () {
    $owner = User::factory()->withoutTwoFactor()->create();
    $workspace = Workspace::factory()->create([
        'owner_id' => $owner->id,
        'require_two_factor' => true,
    ]);

    $member = User::factory()->withoutTwoFactor()->create([
        'current_workspace_id' => $workspace->id,
    ]);
    $workspace->users()->attach($member->id, ['role' => 'member']);
    $member->load('currentWorkspace');

    $middleware = new RequireTwoFactor;

    // Test the Fortify 2FA path
    $request = Request::create('/user/two-factor-authentication');
    $request->setUserResolver(fn () => $member);

    $response = $middleware->handle($request, fn () => response('ok'));

    expect($response->getContent())->toBe('ok');
});

it('allows the logout route for members without 2FA', function () {
    $owner = User::factory()->withoutTwoFactor()->create();
    $workspace = Workspace::factory()->create([
        'owner_id' => $owner->id,
        'require_two_factor' => true,
    ]);

    $member = User::factory()->withoutTwoFactor()->create([
        'current_workspace_id' => $workspace->id,
    ]);
    $workspace->users()->attach($member->id, ['role' => 'member']);
    $member->load('currentWorkspace');

    $middleware = new RequireTwoFactor;
    $request = Request::create('/logout', 'POST');
    $request->setUserResolver(fn () => $member);

    // Register the route so routeIs works
    $route = Route::post('/logout', fn () => 'ok')->name('logout');
    $request->setRouteResolver(fn () => $route);

    $response = $middleware->handle($request, fn () => response('ok'));

    expect($response->getContent())->toBe('ok');
});
