<?php

use App\Events\SubscriptionUpdated;
use App\Events\WorkspaceMemberAdded;
use App\Events\WorkspaceMemberRemoved;
use App\Events\WorkspaceMemberRoleUpdated;
use App\Events\WorkspaceUpdated;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\Event;

it('dispatches WorkspaceMemberAdded event', function () {
    Event::fake([WorkspaceMemberAdded::class]);

    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();

    WorkspaceMemberAdded::dispatch($workspace, $user);

    Event::assertDispatched(WorkspaceMemberAdded::class, function ($event) use ($workspace, $user) {
        return $event->workspace->id === $workspace->id
            && $event->member->id === $user->id;
    });
});

it('dispatches WorkspaceMemberRemoved event', function () {
    Event::fake([WorkspaceMemberRemoved::class]);

    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();

    WorkspaceMemberRemoved::dispatch($workspace, $user);

    Event::assertDispatched(WorkspaceMemberRemoved::class, function ($event) use ($workspace, $user) {
        return $event->workspace->id === $workspace->id
            && $event->member->id === $user->id;
    });
});

it('dispatches WorkspaceMemberRoleUpdated event', function () {
    Event::fake([WorkspaceMemberRoleUpdated::class]);

    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();

    WorkspaceMemberRoleUpdated::dispatch($workspace, $user, 'admin');

    Event::assertDispatched(WorkspaceMemberRoleUpdated::class, function ($event) use ($workspace, $user) {
        return $event->workspace->id === $workspace->id
            && $event->member->id === $user->id
            && $event->role === 'admin';
    });
});

it('dispatches WorkspaceUpdated event', function () {
    Event::fake([WorkspaceUpdated::class]);

    $workspace = Workspace::factory()->create();

    WorkspaceUpdated::dispatch($workspace);

    Event::assertDispatched(WorkspaceUpdated::class, function ($event) use ($workspace) {
        return $event->workspace->id === $workspace->id;
    });
});

it('dispatches SubscriptionUpdated event', function () {
    Event::fake([SubscriptionUpdated::class]);

    $workspace = Workspace::factory()->create();

    SubscriptionUpdated::dispatch($workspace);

    Event::assertDispatched(SubscriptionUpdated::class, function ($event) use ($workspace) {
        return $event->workspace->id === $workspace->id;
    });
});
