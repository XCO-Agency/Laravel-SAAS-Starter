<?php

use App\Models\User;
use App\Models\Workspace;
use App\Services\WorkspaceService;

/**
 * Helper to create a user with a personal workspace (simulating registration).
 */
function createUserWithWorkspace(): array
{
    $user = User::factory()->create();
    $workspaceService = app(WorkspaceService::class);
    $workspace = $workspaceService->createPersonalWorkspace($user);

    return [$user, $workspace];
}

beforeEach(function () {
    [$this->user, $this->workspace] = createUserWithWorkspace();
});

describe('Workspace Index', function () {
    it('displays user workspaces', function () {
        $this->actingAs($this->user)
            ->get('/workspaces')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('workspaces/index')
                ->has('workspaces')
            );
    });

    it('requires authentication', function () {
        $this->get('/workspaces')
            ->assertRedirect('/login');
    });
});

describe('Workspace Creation', function () {
    it('redirects when workspace limit reached on free plan', function () {
        // Free plan only allows 1 workspace (personal workspace already exists)
        $this->actingAs($this->user)
            ->get('/workspaces/create')
            ->assertRedirect('/workspaces')
            ->assertSessionHas('error');
    });

    it('prevents creating workspace when limit reached on free plan', function () {
        // Free plan only allows 1 workspace
        $this->actingAs($this->user)
            ->post('/workspaces', [
                'name' => 'Another Workspace',
            ])
            ->assertRedirect('/workspaces')
            ->assertSessionHas('error');
    });

    it('validates workspace name is required', function () {
        // Upgrade user to allow workspace creation
        $this->workspace->update(['stripe_id' => 'cus_test']);
        $this->workspace->subscriptions()->create([
            'type' => 'default',
            'stripe_id' => 'sub_test',
            'stripe_status' => 'active',
            'stripe_price' => config('billing.plans.pro.stripe_price_id.monthly'),
        ]);

        $this->actingAs($this->user)
            ->post('/workspaces', [
                'name' => '',
            ])
            ->assertSessionHasErrors('name');
    });
});

describe('Workspace Settings', function () {
    it('displays workspace settings page', function () {
        $this->actingAs($this->user)
            ->get('/workspaces/settings')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('workspaces/settings')
                ->has('workspace')
            );
    });

    it('allows owner to update workspace name', function () {
        $this->actingAs($this->user)
            ->put('/workspaces/settings', [
                'name' => 'Updated Workspace Name',
                'slug' => $this->workspace->slug,
            ])
            ->assertRedirect();

        expect($this->workspace->fresh()->name)->toBe('Updated Workspace Name');
    });

    it('allows admin to update workspace settings', function () {
        [$admin, $adminWorkspace] = createUserWithWorkspace();
        $this->workspace->addUser($admin, 'admin');
        $admin->switchWorkspace($this->workspace);

        $this->actingAs($admin)
            ->put('/workspaces/settings', [
                'name' => 'Admin Updated Name',
                'slug' => $this->workspace->slug,
            ])
            ->assertRedirect();

        expect($this->workspace->fresh()->name)->toBe('Admin Updated Name');
    });

    it('prevents member from updating workspace settings', function () {
        [$member, $memberWorkspace] = createUserWithWorkspace();
        $this->workspace->addUser($member, 'member');
        $member->switchWorkspace($this->workspace);

        $this->actingAs($member)
            ->put('/workspaces/settings', [
                'name' => 'Member Updated Name',
                'slug' => $this->workspace->slug,
            ])
            ->assertForbidden();
    });
});

describe('Workspace Switching', function () {
    it('allows user to switch between workspaces they belong to', function () {
        // Create another workspace and add this user to it
        [$otherUser, $otherWorkspace] = createUserWithWorkspace();
        $otherWorkspace->addUser($this->user, 'member');

        $this->actingAs($this->user)
            ->post("/workspaces/{$otherWorkspace->id}/switch")
            ->assertRedirect();

        expect($this->user->fresh()->current_workspace_id)->toBe($otherWorkspace->id);
    });

    it('prevents switching to workspace user is not a member of', function () {
        [$otherUser, $otherWorkspace] = createUserWithWorkspace();

        $this->actingAs($this->user)
            ->post("/workspaces/{$otherWorkspace->id}/switch")
            ->assertForbidden();
    });
});

describe('Workspace Deletion', function () {
    it('allows owner to delete non-personal workspace', function () {
        // Create a non-personal workspace
        $workspaceToDelete = Workspace::create([
            'name' => 'Deletable Workspace',
            'slug' => 'deletable-workspace',
            'owner_id' => $this->user->id,
            'personal_workspace' => false,
        ]);
        $workspaceToDelete->addUser($this->user, 'owner');
        $this->user->switchWorkspace($workspaceToDelete);

        $this->actingAs($this->user)
            ->delete('/workspaces')
            ->assertRedirect();

        $this->assertSoftDeleted('workspaces', ['id' => $workspaceToDelete->id]);
    });

    it('prevents non-owner from deleting workspace', function () {
        // Create another user and add them as admin
        [$admin, $adminWorkspace] = createUserWithWorkspace();
        $this->workspace->addUser($admin, 'admin');
        $admin->switchWorkspace($this->workspace);

        $this->actingAs($admin)
            ->delete('/workspaces')
            ->assertForbidden();
    });

    it('prevents deletion of personal workspace', function () {
        // The workspace created in beforeEach is a personal workspace
        expect($this->workspace->personal_workspace)->toBeTrue();

        $this->actingAs($this->user)
            ->delete('/workspaces')
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseHas('workspaces', ['id' => $this->workspace->id]);
    });
});
