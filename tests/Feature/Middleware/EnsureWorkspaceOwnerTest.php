<?php

use App\Http\Middleware\EnsureWorkspaceOwner;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

it('aborts when user is not authenticated', function () {
    $middleware = new EnsureWorkspaceOwner;
    $request = Request::create('/test');

    $middleware->handle($request, fn () => response('ok'));
})->throws(HttpException::class);

it('aborts when user has no current workspace', function () {
    $user = User::factory()->withoutTwoFactor()->create();

    $middleware = new EnsureWorkspaceOwner;
    $request = Request::create('/test');
    $request->setUserResolver(fn () => $user);

    $middleware->handle($request, fn () => response('ok'));
})->throws(HttpException::class);

it('aborts when user is a regular member', function () {
    $owner = User::factory()->withoutTwoFactor()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);

    $member = User::factory()->withoutTwoFactor()->create();
    $workspace->users()->attach($member->id, ['role' => 'member']);
    $member->update(['current_workspace_id' => $workspace->id]);

    $middleware = new EnsureWorkspaceOwner;
    $request = Request::create('/test');
    $request->setUserResolver(fn () => $member->fresh());

    $middleware->handle($request, fn () => response('ok'));
})->throws(HttpException::class);

it('aborts when user is an admin but not owner', function () {
    $owner = User::factory()->withoutTwoFactor()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);

    $admin = User::factory()->withoutTwoFactor()->create();
    $workspace->users()->attach($admin->id, ['role' => 'admin']);
    $admin->update(['current_workspace_id' => $workspace->id]);

    $middleware = new EnsureWorkspaceOwner;
    $request = Request::create('/test');
    $request->setUserResolver(fn () => $admin->fresh());

    $middleware->handle($request, fn () => response('ok'));
})->throws(HttpException::class);

it('allows workspace owners', function () {
    $owner = User::factory()->withoutTwoFactor()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
    $workspace->users()->attach($owner->id, ['role' => 'owner']);
    $owner->update(['current_workspace_id' => $workspace->id]);

    $middleware = new EnsureWorkspaceOwner;
    $request = Request::create('/test');
    $request->setUserResolver(fn () => $owner->fresh());

    $response = $middleware->handle($request, fn () => response('ok'));

    expect($response->getContent())->toBe('ok');
});
