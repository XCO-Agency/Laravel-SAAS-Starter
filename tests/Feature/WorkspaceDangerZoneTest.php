<?php

use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->owner->id]);
    $this->workspace->addUser($this->owner, 'owner');
    $this->owner->switchWorkspace($this->workspace);
});

// --- Danger Zone Page ---

it('requires authentication to view danger zone', function () {
    $this->get('/settings/workspace-danger-zone')->assertRedirect('/login');
});

it('allows workspace owner to view danger zone', function () {
    $this->actingAs($this->owner)
        ->get('/settings/workspace-danger-zone')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('settings/workspace-danger-zone'));
});

it('allows workspace member to view danger zone', function () {
    $member = User::factory()->create();
    $this->workspace->addUser($member, 'member');
    $member->switchWorkspace($this->workspace);

    $this->actingAs($member)
        ->get('/settings/workspace-danger-zone')
        ->assertOk();
});

it('passes workspace data and user role to the page', function () {
    $this->actingAs($this->owner)
        ->get('/settings/workspace-danger-zone')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('workspace')
            ->has('userRole')
            ->where('workspace.id', $this->workspace->id)
            ->where('workspace.name', $this->workspace->name)
            ->where('userRole', 'owner')
        );
});

it('shows member role for non-owners', function () {
    $member = User::factory()->create();
    $this->workspace->addUser($member, 'member');
    $member->switchWorkspace($this->workspace);

    $this->actingAs($member)
        ->get('/settings/workspace-danger-zone')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('userRole', 'member'));
});

// --- Leave Workspace ---

it('requires authentication to leave workspace', function () {
    $this->delete('/workspaces/leave')->assertRedirect('/login');
});

it('allows a member to leave a workspace', function () {
    $member = User::factory()->create();
    $this->workspace->addUser($member, 'member');
    $member->switchWorkspace($this->workspace);

    $this->actingAs($member)
        ->delete('/workspaces/leave')
        ->assertRedirect('/dashboard');

    expect($this->workspace->fresh()->hasUser($member))->toBeFalse();
});

it('prevents an owner from leaving the workspace', function () {
    $this->actingAs($this->owner)
        ->delete('/workspaces/leave')
        ->assertRedirect();

    expect(session('error'))->toContain('Transfer ownership');
    expect($this->workspace->fresh()->hasUser($this->owner))->toBeTrue();
});

it('switches to personal workspace after leaving', function () {
    $member = User::factory()->create();
    $personalWorkspace = Workspace::factory()->create([
        'owner_id' => $member->id,
        'personal_workspace' => true,
    ]);
    $personalWorkspace->addUser($member, 'owner');
    $this->workspace->addUser($member, 'member');
    $member->switchWorkspace($this->workspace);

    $this->actingAs($member)
        ->delete('/workspaces/leave');

    expect($member->fresh()->current_workspace_id)->toBe($personalWorkspace->id);
});

it('prevents leaving a personal workspace', function () {
    $personalWorkspace = Workspace::factory()->create([
        'owner_id' => $this->owner->id,
        'personal_workspace' => true,
    ]);
    $personalWorkspace->addUser($this->owner, 'owner');
    $this->owner->switchWorkspace($personalWorkspace);

    $this->actingAs($this->owner)
        ->delete('/workspaces/leave')
        ->assertRedirect();

    expect(session('error'))->toContain('personal workspace');
});
