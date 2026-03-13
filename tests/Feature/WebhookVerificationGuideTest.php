<?php

use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->owner->id]);
    $this->workspace->addUser($this->owner, 'owner');
    $this->owner->switchWorkspace($this->workspace);
});

it('requires authentication to view verification guide', function () {
    $this->get("/workspaces/{$this->workspace->id}/webhooks/verification-guide")
        ->assertRedirect('/login');
});

it('allows workspace owner to view verification guide', function () {
    $this->actingAs($this->owner)
        ->get("/workspaces/{$this->workspace->id}/webhooks/verification-guide")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('workspaces/webhooks/verification-guide')
        );
});

it('allows workspace admin to view verification guide', function () {
    $admin = User::factory()->create();
    $this->workspace->addUser($admin, 'admin');
    $admin->switchWorkspace($this->workspace);

    $this->actingAs($admin)
        ->get("/workspaces/{$this->workspace->id}/webhooks/verification-guide")
        ->assertOk();
});

it('forbids workspace member from viewing verification guide', function () {
    $member = User::factory()->create();
    $this->workspace->addUser($member, 'member');
    $member->switchWorkspace($this->workspace);

    $this->actingAs($member)
        ->get("/workspaces/{$this->workspace->id}/webhooks/verification-guide")
        ->assertForbidden();
});

it('passes signature header and algorithm to the page', function () {
    $this->actingAs($this->owner)
        ->get("/workspaces/{$this->workspace->id}/webhooks/verification-guide")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('signatureHeader')
            ->has('algorithm')
            ->where('signatureHeader', 'Signature')
            ->where('algorithm', 'sha256')
        );
});

it('passes the workspace to the page', function () {
    $this->actingAs($this->owner)
        ->get("/workspaces/{$this->workspace->id}/webhooks/verification-guide")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('workspace')
            ->where('workspace.id', $this->workspace->id)
        );
});
