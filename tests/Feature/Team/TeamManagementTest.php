<?php

use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->owner->id]);
    $this->workspace->addUser($this->owner, 'owner');
    $this->owner->switchWorkspace($this->workspace);
});

describe('Team Index', function () {
    it('displays team members page', function () {
        $this->actingAs($this->owner)
            ->get('/team')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Team/index')
                ->has('members')
                ->has('pendingInvitations')
            );
    });

    it('shows current user role', function () {
        $this->actingAs($this->owner)
            ->get('/team')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('userRole', 'owner')
            );
    });

    it('requires authentication', function () {
        $this->get('/team')
            ->assertRedirect('/login');
    });
});

describe('Team Member Removal', function () {
    it('allows owner to remove member', function () {
        $member = User::factory()->create();
        $this->workspace->addUser($member, 'member');

        $this->actingAs($this->owner)
            ->delete("/team/members/{$member->id}")
            ->assertRedirect();

        expect($this->workspace->fresh()->hasUser($member))->toBeFalse();
    });

    it('allows admin to remove member', function () {
        $admin = User::factory()->create();
        $this->workspace->addUser($admin, 'admin');
        $admin->switchWorkspace($this->workspace);

        $member = User::factory()->create();
        $this->workspace->addUser($member, 'member');

        $this->actingAs($admin)
            ->delete("/team/members/{$member->id}")
            ->assertRedirect();

        expect($this->workspace->fresh()->hasUser($member))->toBeFalse();
    });

    it('prevents member from removing other members', function () {
        $member1 = User::factory()->create();
        $this->workspace->addUser($member1, 'member');
        $member1->switchWorkspace($this->workspace);

        $member2 = User::factory()->create();
        $this->workspace->addUser($member2, 'member');

        $this->actingAs($member1)
            ->delete("/team/members/{$member2->id}")
            ->assertForbidden();

        expect($this->workspace->fresh()->hasUser($member2))->toBeTrue();
    });

    it('prevents owner from being removed', function () {
        $admin = User::factory()->create();
        $this->workspace->addUser($admin, 'admin');
        $admin->switchWorkspace($this->workspace);

        $this->actingAs($admin)
            ->delete("/team/members/{$this->owner->id}")
            ->assertRedirect();

        expect($this->workspace->fresh()->hasUser($this->owner))->toBeTrue();
    });
});

describe('Role Updates', function () {
    it('allows owner to update member role to admin', function () {
        $member = User::factory()->create();
        $this->workspace->addUser($member, 'member');

        $this->actingAs($this->owner)
            ->put("/team/members/{$member->id}/role", [
                'role' => 'admin',
            ])
            ->assertRedirect();

        expect($this->workspace->fresh()->getUserRole($member))->toBe('admin');
    });

    it('allows owner to update admin role to member', function () {
        $admin = User::factory()->create();
        $this->workspace->addUser($admin, 'admin');

        $this->actingAs($this->owner)
            ->put("/team/members/{$admin->id}/role", [
                'role' => 'member',
            ])
            ->assertRedirect();

        expect($this->workspace->fresh()->getUserRole($admin))->toBe('member');
    });

    it('allows admin to update member roles', function () {
        $admin = User::factory()->create();
        $this->workspace->addUser($admin, 'admin');
        $admin->switchWorkspace($this->workspace);

        $member = User::factory()->create();
        $this->workspace->addUser($member, 'member');

        $this->actingAs($admin)
            ->put("/team/members/{$member->id}/role", [
                'role' => 'admin',
            ])
            ->assertRedirect();

        expect($this->workspace->fresh()->getUserRole($member))->toBe('admin');
    });

    it('prevents updating owner role', function () {
        $this->actingAs($this->owner)
            ->put("/team/members/{$this->owner->id}/role", [
                'role' => 'admin',
            ])
            ->assertRedirect();

        expect($this->workspace->fresh()->getUserRole($this->owner))->toBe('owner');
    });

    it('validates role value', function () {
        $member = User::factory()->create();
        $this->workspace->addUser($member, 'member');

        $this->actingAs($this->owner)
            ->put("/team/members/{$member->id}/role", [
                'role' => 'invalid-role',
            ])
            ->assertSessionHasErrors('role');
    });
});

describe('Ownership Transfer', function () {
    it('allows owner to transfer ownership to admin', function () {
        $admin = User::factory()->create();
        $this->workspace->addUser($admin, 'admin');

        $this->actingAs($this->owner)
            ->post("/team/transfer-ownership/{$admin->id}")
            ->assertRedirect();

        expect($this->workspace->fresh()->owner_id)->toBe($admin->id);
        expect($this->workspace->fresh()->getUserRole($admin))->toBe('owner');
        expect($this->workspace->fresh()->getUserRole($this->owner))->toBe('admin');
    });

    it('prevents transferring ownership to member', function () {
        $member = User::factory()->create();
        $this->workspace->addUser($member, 'member');

        $this->actingAs($this->owner)
            ->post("/team/transfer-ownership/{$member->id}")
            ->assertRedirect();

        expect($this->workspace->fresh()->owner_id)->toBe($this->owner->id);
    });

    it('prevents non-owner from transferring ownership', function () {
        $admin = User::factory()->create();
        $this->workspace->addUser($admin, 'admin');
        $admin->switchWorkspace($this->workspace);

        $member = User::factory()->create();
        $this->workspace->addUser($member, 'member');

        $this->actingAs($admin)
            ->post("/team/transfer-ownership/{$member->id}")
            ->assertForbidden();
    });

    it('prevents transferring personal workspace ownership', function () {
        $personalWorkspace = Workspace::factory()->create([
            'owner_id' => $this->owner->id,
            'personal_workspace' => true,
        ]);
        $personalWorkspace->addUser($this->owner, 'owner');
        $this->owner->switchWorkspace($personalWorkspace);

        $admin = User::factory()->create();
        $personalWorkspace->addUser($admin, 'admin');

        $this->actingAs($this->owner)
            ->post("/team/transfer-ownership/{$admin->id}")
            ->assertRedirect();

        expect($personalWorkspace->fresh()->owner_id)->toBe($this->owner->id);
    });
});

describe('Invitation Cancellation', function () {
    it('allows admin to cancel pending invitation', function () {
        $invitation = $this->workspace->invitations()->create([
            'email' => 'pending@example.com',
            'role' => 'member',
        ]);

        $this->actingAs($this->owner)
            ->delete("/team/invitations/{$invitation->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('workspace_invitations', ['id' => $invitation->id]);
    });

    it('prevents member from cancelling invitation', function () {
        $member = User::factory()->create();
        $this->workspace->addUser($member, 'member');
        $member->switchWorkspace($this->workspace);

        $invitation = $this->workspace->invitations()->create([
            'email' => 'pending@example.com',
            'role' => 'member',
        ]);

        $this->actingAs($member)
            ->delete("/team/invitations/{$invitation->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('workspace_invitations', ['id' => $invitation->id]);
    });
});

describe('Team Invitation', function () {
    it('prevents inviting existing member', function () {
        $member = User::factory()->create();
        $this->workspace->addUser($member, 'member');

        $this->actingAs($this->owner)
            ->post('/team/invite', [
                'email' => $member->email,
                'role' => 'admin',
            ])
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseMissing('workspace_invitations', [
            'email' => $member->email,
        ]);
    });

    it('prevents inviting same email twice', function () {
        $this->workspace->invitations()->create([
            'email' => 'test@example.com',
            'role' => 'member',
        ]);

        $this->actingAs($this->owner)
            ->post('/team/invite', [
                'email' => 'test@example.com',
                'role' => 'admin',
            ])
            ->assertRedirect()
            ->assertSessionHas('error');
    });

    it('validates email format', function () {
        $this->actingAs($this->owner)
            ->post('/team/invite', [
                'email' => 'invalid-email',
                'role' => 'member',
            ])
            ->assertSessionHasErrors('email');
    });

    it('validates role selection', function () {
        $this->actingAs($this->owner)
            ->post('/team/invite', [
                'email' => 'valid@example.com',
                'role' => 'invalid-role',
            ])
            ->assertSessionHasErrors('role');
    });
});
