<?php

use App\Events\WorkspaceActivityWasLogged;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\Event;

it('broadcasts WorkspaceActivityWasLogged when a workspace activity is created', function () {
    Event::fake([WorkspaceActivityWasLogged::class]);

    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $user->workspaces()->attach($workspace, ['role' => 'owner']);

    $this->actingAs($user);

    // Perform an action that logs activity
    activity('workspace')
        ->performedOn($workspace)
        ->causedBy($user)
        ->event('updated')
        ->log('Updated workspace settings');

    Event::assertDispatched(WorkspaceActivityWasLogged::class, function ($event) use ($workspace) {
        return $event->workspace->id === $workspace->id
            && $event->message === 'Updated workspace settings'
            && $event->type === 'info';
    });
});

it('broadcasts with correct type based on event', function () {
    Event::fake([WorkspaceActivityWasLogged::class]);

    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

    $this->actingAs($user);

    // Created event should be success
    activity('workspace')
        ->performedOn($workspace)
        ->causedBy($user)
        ->event('created')
        ->log('Created a new resource');

    Event::assertDispatched(WorkspaceActivityWasLogged::class, function ($event) {
        return $event->type === 'success';
    });

    // Deleted event should be warning
    activity('workspace')
        ->performedOn($workspace)
        ->causedBy($user)
        ->event('deleted')
        ->log('Deleted a resource');

    Event::assertDispatched(WorkspaceActivityWasLogged::class, function ($event) {
        return $event->type === 'warning';
    });
});

it('does not broadcast for non-workspace logs', function () {
    Event::fake([WorkspaceActivityWasLogged::class]);

    $user = User::factory()->create();
    $this->actingAs($user);

    activity('default')
        ->log('Some default activity');

    Event::assertNotDispatched(WorkspaceActivityWasLogged::class);
});
