<?php

use App\Models\User;
use App\Models\WebhookEndpoint;
use App\Models\WebhookLog;
use App\Models\Workspace;
use Illuminate\Support\Facades\Queue;
use Spatie\WebhookServer\CallWebhookJob;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->owner->id]);
    $this->workspace->addUser($this->owner, 'owner');
    $this->owner->switchWorkspace($this->workspace);

    $this->endpoint = WebhookEndpoint::factory()->create([
        'workspace_id' => $this->workspace->id,
        'url' => 'https://example.com/webhook',
        'is_active' => true,
    ]);

    $this->log = WebhookLog::factory()->create([
        'workspace_id' => $this->workspace->id,
        'webhook_endpoint_id' => $this->endpoint->id,
        'url' => 'https://example.com/webhook',
        'event_type' => 'WorkspaceUpdated',
        'payload' => ['event' => 'WorkspaceUpdated'],
        'status' => 500,
    ]);
});

it('workspace owner can retry a webhook log entry', function () {
    Queue::fake();

    actingAs($this->owner)
        ->post("/workspaces/{$this->workspace->id}/webhooks/logs/{$this->log->id}/retry")
        ->assertRedirect();

    Queue::assertPushed(CallWebhookJob::class);
});

it('redirects with success flash on retry', function () {
    Queue::fake();

    actingAs($this->owner)
        ->post("/workspaces/{$this->workspace->id}/webhooks/logs/{$this->log->id}/retry")
        ->assertSessionHas('success');
});

it('returns error when endpoint is inactive', function () {
    Queue::fake();

    $this->endpoint->update(['is_active' => false]);

    actingAs($this->owner)
        ->post("/workspaces/{$this->workspace->id}/webhooks/logs/{$this->log->id}/retry")
        ->assertSessionHas('error');

    Queue::assertNothingPushed();
});

it('non-member cannot retry webhook logs', function () {
    $other = User::factory()->create();
    $otherWorkspace = Workspace::factory()->create(['owner_id' => $other->id]);
    $otherWorkspace->addUser($other, 'owner');
    $other->switchWorkspace($otherWorkspace);

    actingAs($other)
        ->post("/workspaces/{$this->workspace->id}/webhooks/logs/{$this->log->id}/retry")
        ->assertForbidden();
});
