<?php

use App\Events\WorkspaceUpdated;
use App\Models\User;
use App\Models\WebhookEndpoint;
use App\Models\Workspace;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;
use Spatie\WebhookServer\CallWebhookJob;

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->owner->id]);
    $this->workspace->addUser($this->owner, 'owner');

    $this->endpoint1 = WebhookEndpoint::factory()->create([
        'workspace_id' => $this->workspace->id,
        'url' => 'https://example.com/webhook1',
        'events' => ['WorkspaceUpdated', 'WorkspaceMemberAdded'],
        'is_active' => true,
    ]);

    $this->endpoint2 = WebhookEndpoint::factory()->create([
        'workspace_id' => $this->workspace->id,
        'url' => 'https://example.com/webhook2',
        'events' => ['SubscriptionUpdated'],
        'is_active' => true,
    ]);
});

it('dispatches to endpoints subscribed to the event', function () {
    Queue::fake([CallWebhookJob::class]);

    $event = new WorkspaceUpdated($this->workspace);
    Event::dispatch($event);

    Queue::assertPushed(CallWebhookJob::class, 1);
});

it('does not dispatch to inactive endpoints', function () {
    $this->endpoint1->update(['is_active' => false]);

    Queue::fake([CallWebhookJob::class]);

    $event = new WorkspaceUpdated($this->workspace);
    Event::dispatch($event);

    Queue::assertNothingPushed();
});
