<?php

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInviteLink;

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->owner->id]);
    $this->workspace->addUser($this->owner, 'owner');
    $this->owner->switchWorkspace($this->workspace);
});

describe('Invite Link Creation', function () {
    it('allows owner to create invite link', function () {
        $this->actingAs($this->owner)
            ->post('/team/invite-links', [
                'role' => 'member',
                'max_uses' => 10,
                'expires_in_days' => 7,
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('workspace_invite_links', [
            'workspace_id' => $this->workspace->id,
            'created_by' => $this->owner->id,
            'role' => 'member',
            'max_uses' => 10,
        ]);
    });

    it('allows admin to create invite link', function () {
        $admin = User::factory()->create();
        $this->workspace->addUser($admin, 'admin');
        $admin->switchWorkspace($this->workspace);

        $this->actingAs($admin)
            ->post('/team/invite-links', [
                'role' => 'member',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');
    });

    it('prevents member from creating invite link', function () {
        $member = User::factory()->create();
        $this->workspace->addUser($member, 'member');
        $member->switchWorkspace($this->workspace);

        $this->actingAs($member)
            ->post('/team/invite-links', [
                'role' => 'member',
            ])
            ->assertForbidden();
    });

    it('validates role field', function () {
        $this->actingAs($this->owner)
            ->post('/team/invite-links', [
                'role' => 'invalid-role',
            ])
            ->assertSessionHasErrors('role');
    });
});

describe('Invite Link Revocation', function () {
    it('allows owner to revoke invite link', function () {
        $link = WorkspaceInviteLink::generateLink($this->workspace, $this->owner);

        $this->actingAs($this->owner)
            ->delete("/team/invite-links/{$link->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('workspace_invite_links', ['id' => $link->id]);
    });

    it('prevents member from revoking invite link', function () {
        $member = User::factory()->create();
        $this->workspace->addUser($member, 'member');
        $member->switchWorkspace($this->workspace);

        $link = WorkspaceInviteLink::generateLink($this->workspace, $this->owner);

        $this->actingAs($member)
            ->delete("/team/invite-links/{$link->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('workspace_invite_links', ['id' => $link->id]);
    });
});

describe('Public Invite Link Page', function () {
    it('displays join page for valid link', function () {
        $link = WorkspaceInviteLink::generateLink($this->workspace, $this->owner);

        $this->get("/join/{$link->token}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Team/join')
                ->where('inviteLink.workspace_name', $this->workspace->name)
                ->where('inviteLink.role', 'member')
            );
    });

    it('redirects for invalid token', function () {
        $this->get('/join/invalid-token-abc')
            ->assertRedirect('/');
    });

    it('redirects for expired link', function () {
        $link = WorkspaceInviteLink::factory()->expired()->create([
            'workspace_id' => $this->workspace->id,
            'created_by' => $this->owner->id,
        ]);

        $this->get("/join/{$link->token}")
            ->assertRedirect('/')
            ->assertSessionHas('error');
    });

    it('redirects for exhausted link', function () {
        $link = WorkspaceInviteLink::factory()->exhausted()->create([
            'workspace_id' => $this->workspace->id,
            'created_by' => $this->owner->id,
        ]);

        $this->get("/join/{$link->token}")
            ->assertRedirect('/')
            ->assertSessionHas('error');
    });
});

describe('Joining via Invite Link', function () {
    it('allows authenticated user to join workspace', function () {
        $link = WorkspaceInviteLink::generateLink($this->workspace, $this->owner);
        $newUser = User::factory()->create();
        // Create personal workspace for the new user
        $personalWs = Workspace::factory()->create([
            'owner_id' => $newUser->id,
            'personal_workspace' => true,
        ]);
        $personalWs->addUser($newUser, 'owner');
        $newUser->switchWorkspace($personalWs);

        $this->actingAs($newUser)
            ->post("/join/{$link->token}")
            ->assertRedirect('/dashboard');

        expect($this->workspace->fresh()->hasUser($newUser))->toBeTrue();
        expect($link->fresh()->uses_count)->toBe(1);
    });

    it('does not allow joining same workspace twice', function () {
        $link = WorkspaceInviteLink::generateLink($this->workspace, $this->owner);

        $this->actingAs($this->owner)
            ->post("/join/{$link->token}")
            ->assertRedirect('/dashboard')
            ->assertSessionHas('info');

        expect($link->fresh()->uses_count)->toBe(0);
    });

    it('requires authentication to join', function () {
        $link = WorkspaceInviteLink::generateLink($this->workspace, $this->owner);

        $this->post("/join/{$link->token}")
            ->assertRedirect('/login');
    });
});
