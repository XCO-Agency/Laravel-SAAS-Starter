<?php

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Models\WorkspaceInviteLink;
use App\Services\InvitationService;

beforeEach(function () {
    $this->owner = User::factory()->create(['email' => 'owner@acme.com']);
    $this->workspace = Workspace::factory()->create([
        'owner_id' => $this->owner->id,
        'personal_workspace' => false,
    ]);
    $this->workspace->addUser($this->owner, 'owner');
    $this->owner->switchWorkspace($this->workspace);
});

describe('Domain Restriction Settings', function () {
    it('owner can save allowed email domains', function () {
        $this->actingAs($this->owner)
            ->put('/settings/workspace-security', [
                'require_two_factor' => false,
                'allowed_ips' => '',
                'allowed_email_domains' => 'acme.com, corp.example.com',
            ])
            ->assertRedirect();

        $this->workspace->refresh();
        expect($this->workspace->allowed_email_domains)->toBe(['acme.com', 'corp.example.com']);
    });

    it('non-owner cannot update security settings', function () {
        $member = User::factory()->create(['email' => 'member@acme.com']);
        $this->workspace->addUser($member, 'member');

        $this->actingAs($member)
            ->put('/settings/workspace-security', [
                'require_two_factor' => false,
                'allowed_ips' => '',
                'allowed_email_domains' => 'acme.com',
            ])
            ->assertForbidden();
    });

    it('rejects an invalid domain format', function () {
        $this->actingAs($this->owner)
            ->put('/settings/workspace-security', [
                'require_two_factor' => false,
                'allowed_ips' => '',
                'allowed_email_domains' => 'not-a-valid-domain',
            ])
            ->assertSessionHasErrors('allowed_email_domains');
    });

    it('clears domain restrictions when field is empty', function () {
        $this->workspace->update(['allowed_email_domains' => ['acme.com']]);

        $this->actingAs($this->owner)
            ->put('/settings/workspace-security', [
                'require_two_factor' => false,
                'allowed_ips' => '',
                'allowed_email_domains' => '',
            ])
            ->assertRedirect();

        $this->workspace->refresh();
        expect($this->workspace->allowed_email_domains)->toBeNull();
    });
});

describe('Workspace::isEmailDomainAllowed', function () {
    it('allows all emails when no restriction is set', function () {
        expect($this->workspace->isEmailDomainAllowed('anyone@anything.io'))->toBeTrue();
    });

    it('allows email when domain matches', function () {
        $this->workspace->update(['allowed_email_domains' => ['acme.com']]);
        expect($this->workspace->isEmailDomainAllowed('alice@acme.com'))->toBeTrue();
    });

    it('blocks email when domain does not match', function () {
        $this->workspace->update(['allowed_email_domains' => ['acme.com']]);
        expect($this->workspace->isEmailDomainAllowed('alice@other.com'))->toBeFalse();
    });

    it('allows any of multiple allowed domains', function () {
        $this->workspace->update(['allowed_email_domains' => ['acme.com', 'corp.example.com']]);
        expect($this->workspace->isEmailDomainAllowed('bob@corp.example.com'))->toBeTrue();
    });
});

describe('Invitation acceptance enforcement', function () {
    it('blocks invitation acceptance when domain is not allowed', function () {
        $this->workspace->update(['allowed_email_domains' => ['acme.com']]);

        $outsider = User::factory()->create(['email' => 'outsider@other.com']);
        $invitation = WorkspaceInvitation::factory()->create([
            'workspace_id' => $this->workspace->id,
            'email' => $outsider->email,
            'role' => 'member',
            'expires_at' => now()->addDays(7),
        ]);

        $service = app(InvitationService::class);
        expect(fn () => $service->accept($invitation, $outsider))
            ->toThrow(InvalidArgumentException::class, 'email domain is not permitted');
    });

    it('allows invitation acceptance when domain matches', function () {
        $this->workspace->update(['allowed_email_domains' => ['acme.com']]);

        $insider = User::factory()->create(['email' => 'insider@acme.com']);
        $invitation = WorkspaceInvitation::factory()->create([
            'workspace_id' => $this->workspace->id,
            'email' => $insider->email,
            'role' => 'member',
            'expires_at' => now()->addDays(7),
        ]);

        $service = app(InvitationService::class);
        expect($service->accept($invitation, $insider))->toBeTrue();
    });
});

describe('Invite link join enforcement', function () {
    it('blocks invite-link join when domain is not allowed', function () {
        $this->workspace->update(['allowed_email_domains' => ['acme.com']]);

        $link = WorkspaceInviteLink::generateLink($this->workspace, $this->owner);
        $outsider = User::factory()->create(['email' => 'outsider@other.com']);

        $this->actingAs($outsider)
            ->post("/join/{$link->token}")
            ->assertRedirect("/join/{$link->token}")
            ->assertSessionHas('error');

        expect($this->workspace->hasUser($outsider))->toBeFalse();
    });
});
