<?php

use App\Events\WorkspaceActivityWasLogged;
use App\Models\User;
use App\Models\Workspace;
use App\Observers\ActivityLogObserver;
use Illuminate\Support\Facades\Event;

it('broadcasts event for workspace activity logs', function () {
    Event::fake([WorkspaceActivityWasLogged::class]);

    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

    activity('workspace')
        ->performedOn($workspace)
        ->event('created')
        ->log('Workspace was created');

    Event::assertDispatched(WorkspaceActivityWasLogged::class, function ($event) use ($workspace) {
        return $event->workspace->id === $workspace->id
            && $event->message === 'Workspace was created'
            && $event->type === 'success';
    });
});

it('skips non-workspace log names', function () {
    Event::fake([WorkspaceActivityWasLogged::class]);

    $user = User::factory()->create();

    activity('default')
        ->performedOn($user)
        ->event('created')
        ->log('User was created');

    Event::assertNotDispatched(WorkspaceActivityWasLogged::class);
});

it('maps event types correctly', function () {
    $observer = new ActivityLogObserver;
    $reflection = new ReflectionClass($observer);
    $method = $reflection->getMethod('getLogType');
    $method->setAccessible(true);

    expect($method->invoke($observer, 'created'))->toBe('success');
    expect($method->invoke($observer, 'deleted'))->toBe('warning');
    expect($method->invoke($observer, 'updated'))->toBe('info');
    expect($method->invoke($observer, null))->toBe('info');
});

it('broadcasts warning type for deleted events', function () {
    Event::fake([WorkspaceActivityWasLogged::class]);

    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

    activity('workspace')
        ->performedOn($workspace)
        ->event('deleted')
        ->log('Workspace was deleted');

    Event::assertDispatched(WorkspaceActivityWasLogged::class, function ($event) {
        return $event->type === 'warning';
    });
});
