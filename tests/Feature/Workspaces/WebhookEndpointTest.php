<?php

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Spatie\WebhookServer\Events\DispatchingWebhookCallEvent;

uses(RefreshDatabase::class);

it('allows workspace admins to view webhook endpoints', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $user->workspaces()->attach($workspace, ['role' => 'admin']);
    $user->switchWorkspace($workspace);

    $this->actingAs($user);

    $response = $this->get("/workspaces/{$workspace->id}/webhooks");

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page->component('workspaces/webhooks/index'));
});

it('prevents regular members from viewing webhook endpoints', function () {
    $owner = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);

    $member = User::factory()->create();
    $member->workspaces()->attach($workspace, ['role' => 'member']);
    $member->switchWorkspace($workspace);

    $this->actingAs($member);

    $response = $this->get("/workspaces/{$workspace->id}/webhooks");

    $response->assertForbidden();
});

it('allows workspace admins to create a webhook endpoint', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $user->workspaces()->attach($workspace, ['role' => 'admin']);
    $user->switchWorkspace($workspace);

    $this->actingAs($user);

    $response = $this->post("/workspaces/{$workspace->id}/webhooks", [
        'url' => 'https://example.com/webhooks',
        'is_active' => true,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('webhook_endpoints', [
        'workspace_id' => $workspace->id,
        'url' => 'https://example.com/webhooks',
    ]);
});

it('allows workspace admins to delete a webhook endpoint', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $user->workspaces()->attach($workspace, ['role' => 'admin']);
    $user->switchWorkspace($workspace);

    $endpoint = $workspace->webhookEndpoints()->create([
        'url' => 'https://example.com/delete-me',
    ]);

    $this->actingAs($user);

    $response = $this->delete("/workspaces/{$workspace->id}/webhooks/{$endpoint->id}");

    $response->assertRedirect();
    $this->assertDatabaseMissing('webhook_endpoints', [
        'id' => $endpoint->id,
    ]);
});

it('dispatches a ping event via spatie webhook server', function () {
    // We can fake the Event bus to ensure the underlying DispatchingWebhookCall event is fired.
    Event::fake([DispatchingWebhookCallEvent::class]);

    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $user->workspaces()->attach($workspace, ['role' => 'admin']);
    $user->switchWorkspace($workspace);

    $endpoint = $workspace->webhookEndpoints()->create([
        'url' => 'https://example.com/ping',
    ]);

    $this->actingAs($user);

    $response = $this->post("/workspaces/{$workspace->id}/webhooks/{$endpoint->id}/ping");

    $response->assertRedirect();
    Event::assertDispatched(DispatchingWebhookCallEvent::class);
});
