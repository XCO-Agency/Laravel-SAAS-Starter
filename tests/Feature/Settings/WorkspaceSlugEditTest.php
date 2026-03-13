<?php

use App\Models\User;
use App\Models\Workspace;
use App\Services\WorkspaceService;

beforeEach(function () {
    $this->user = User::factory()->create();
    $workspaceService = app(WorkspaceService::class);
    $this->workspace = $workspaceService->createPersonalWorkspace($this->user);
});

it('owner can change the workspace slug', function () {
    $this->actingAs($this->user)
        ->put('/workspaces/settings', [
            'name' => $this->workspace->name,
            'slug' => 'my-new-slug',
        ])
        ->assertRedirect();

    expect($this->workspace->fresh()->slug)->toBe('my-new-slug');
});

it('slug is normalised to lowercase on save', function () {
    $this->actingAs($this->user)
        ->put('/workspaces/settings', [
            'name' => $this->workspace->name,
            'slug' => 'My-Cool-Workspace',
        ])
        ->assertRedirect();

    expect($this->workspace->fresh()->slug)->toBe('my-cool-workspace');
});

it('rejects a slug already taken by another workspace', function () {
    Workspace::factory()->create(['slug' => 'taken-slug']);

    $this->actingAs($this->user)
        ->put('/workspaces/settings', [
            'name' => $this->workspace->name,
            'slug' => 'taken-slug',
        ])
        ->assertSessionHasErrors(['slug']);

    expect($this->workspace->fresh()->slug)->not->toBe('taken-slug');
});

it('allows keeping the same slug on update', function () {
    $originalSlug = $this->workspace->slug;

    $this->actingAs($this->user)
        ->put('/workspaces/settings', [
            'name' => 'Updated Name',
            'slug' => $originalSlug,
        ])
        ->assertRedirect();

    expect($this->workspace->fresh()->slug)->toBe($originalSlug);
});

it('rejects slugs with invalid characters', function () {
    $this->actingAs($this->user)
        ->put('/workspaces/settings', [
            'name' => $this->workspace->name,
            'slug' => 'invalid slug!',
        ])
        ->assertSessionHasErrors(['slug']);
});

it('member cannot update the workspace slug', function () {
    $member = User::factory()->create();
    $this->workspace->addUser($member, 'member');
    $member->switchWorkspace($this->workspace);

    $this->actingAs($member)
        ->put('/workspaces/settings', [
            'name' => $this->workspace->name,
            'slug' => 'hijacked-slug',
        ])
        ->assertForbidden();

    expect($this->workspace->fresh()->slug)->not->toBe('hijacked-slug');
});

it('settings page shows current slug', function () {
    $this->actingAs($this->user)
        ->get('/workspaces/settings')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('workspace.slug', $this->workspace->slug)
        );
});
