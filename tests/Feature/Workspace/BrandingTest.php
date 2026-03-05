<?php

use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->workspace = Workspace::factory()->create([
        'owner_id' => $this->owner->id,
    ]);
    $this->workspace->addUser($this->owner, 'owner');
    $this->owner->switchWorkspace($this->workspace);
});

it('displays workspace settings with accent_color', function () {
    $this->workspace->update(['accent_color' => '#ec4899']);

    $this->actingAs($this->owner)
        ->get('/workspaces/settings')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('workspaces/settings')
            ->where('workspace.accent_color', '#ec4899')
        );
});

it('allows admin to update accent_color', function () {
    $this->actingAs($this->owner)
        ->put('/workspaces/settings', [
            'name' => $this->workspace->name,
            'accent_color' => '#6366f1',
        ])
        ->assertRedirect();

    expect($this->workspace->fresh()->accent_color)->toBe('#6366f1');
});

it('validates accent_color format', function () {
    $this->actingAs($this->owner)
        ->put('/workspaces/settings', [
            'name' => $this->workspace->name,
            'accent_color' => 'not-a-color',
        ])
        ->assertSessionHasErrors('accent_color');
});

it('allows clearing accent_color', function () {
    $this->workspace->update(['accent_color' => '#ec4899']);

    $this->actingAs($this->owner)
        ->put('/workspaces/settings', [
            'name' => $this->workspace->name,
            'accent_color' => null,
        ])
        ->assertRedirect();

    expect($this->workspace->fresh()->accent_color)->toBeNull();
});

it('prevents members from updating branding', function () {
    $member = User::factory()->create();
    $this->workspace->addUser($member, 'member');
    $member->switchWorkspace($this->workspace);

    $this->actingAs($member)
        ->put('/workspaces/settings', [
            'name' => $this->workspace->name,
            'accent_color' => '#ef4444',
        ])
        ->assertForbidden();
});
