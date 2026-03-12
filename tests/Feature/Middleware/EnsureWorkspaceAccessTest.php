<?php

use App\Http\Middleware\EnsureWorkspaceAccess;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

it('redirects unauthenticated users to login', function () {
    $request = Request::create('/test');
    $middleware = new EnsureWorkspaceAccess;

    $response = $middleware->handle($request, fn () => response('OK'));

    expect($response->getStatusCode())->toBe(302);
    expect($response->headers->get('Location'))->toContain('login');
});

it('allows access when user has a current workspace they belong to', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user->id, ['role' => 'owner']);
    $user->update(['current_workspace_id' => $workspace->id]);

    $request = Request::create('/test');
    $request->setUserResolver(fn () => $user);

    $middleware = new EnsureWorkspaceAccess;
    $response = $middleware->handle($request, fn () => response('OK'));

    expect($response->getStatusCode())->toBe(200);
    expect($response->getContent())->toBe('OK');
});

it('falls back to personal workspace when current workspace is null', function () {
    $user = User::factory()->create(['current_workspace_id' => null]);
    $workspace = Workspace::factory()->personal()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user->id, ['role' => 'owner']);

    $request = Request::create('/test');
    $request->setUserResolver(fn () => $user);

    $middleware = new EnsureWorkspaceAccess;
    $response = $middleware->handle($request, fn () => response('OK'));

    expect($response->getStatusCode())->toBe(200);

    $user->refresh();
    expect($user->current_workspace_id)->toBe($workspace->id);
});

it('aborts 403 when user has no workspaces at all', function () {
    $user = User::factory()->create(['current_workspace_id' => null]);

    $request = Request::create('/test');
    $request->setUserResolver(fn () => $user);

    $middleware = new EnsureWorkspaceAccess;
    $middleware->handle($request, fn () => response('OK'));
})->throws(HttpException::class);

it('switches to another workspace when user does not belong to current', function () {
    $user = User::factory()->create();
    $ownedWorkspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $ownedWorkspace->users()->attach($user->id, ['role' => 'owner']);

    // Set current workspace to one the user doesn't belong to
    $otherWorkspace = Workspace::factory()->create();
    $user->update(['current_workspace_id' => $otherWorkspace->id]);

    $request = Request::create('/test');
    $request->setUserResolver(fn () => $user);

    $middleware = new EnsureWorkspaceAccess;
    $response = $middleware->handle($request, fn () => response('OK'));

    expect($response->getStatusCode())->toBe(200);

    $user->refresh();
    expect($user->current_workspace_id)->toBe($ownedWorkspace->id);
});
