<?php

use App\Models\User;
use App\Services\WorkspaceService;

beforeEach(function () {
    $this->owner = User::factory()->create();
    $workspaceService = app(WorkspaceService::class);
    $this->workspace = $workspaceService->createPersonalWorkspace($this->owner);
    $this->owner->switchWorkspace($this->workspace);
});

it('redirects guests from member export', function () {
    $this->get('/team/export-members')->assertRedirect('/login');
});

it('forbids members from exporting the member list', function () {
    $member = User::factory()->create();
    $this->workspace->addUser($member, 'member');
    $member->switchWorkspace($this->workspace);

    $this->actingAs($member)
        ->get('/team/export-members')
        ->assertForbidden();
});

it('allows workspace owner to download member CSV', function () {
    $this->actingAs($this->owner)
        ->get('/team/export-members')
        ->assertOk()
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});

it('csv contains correct headers', function () {
    $response = $this->actingAs($this->owner)
        ->get('/team/export-members');

    $content = $response->streamedContent();

    expect($content)
        ->toContain('ID')
        ->toContain('Name')
        ->toContain('Email')
        ->toContain('Role')
        ->toContain('Timezone')
        ->toContain('Joined At');
});

it('csv contains workspace members', function () {
    $member = User::factory()->create(['name' => 'Alice Smith', 'email' => 'alice@example.com']);
    $this->workspace->addUser($member, 'member');

    $response = $this->actingAs($this->owner)
        ->get('/team/export-members');

    $content = $response->streamedContent();

    expect($content)
        ->toContain('Alice Smith')
        ->toContain('alice@example.com')
        ->toContain('member');
});

it('csv filename includes date', function () {
    $this->actingAs($this->owner)
        ->get('/team/export-members')
        ->assertHeader('Content-Disposition', 'attachment; filename=members-'.now()->format('Y-m-d').'.csv');
});

it('allows admin to download member CSV', function () {
    $admin = User::factory()->create();
    $this->workspace->addUser($admin, 'admin');
    $admin->switchWorkspace($this->workspace);

    $this->actingAs($admin)
        ->get('/team/export-members')
        ->assertOk();
});
