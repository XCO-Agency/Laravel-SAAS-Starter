<?php

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Notifications\TeamInvitationNotification;
use App\Services\InvitationService;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    $this->service = new InvitationService;
    $this->user = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);

    // owner is already added as owner in Workspace model boot or factory?
    // Let's ensure owner is in users pivot for relation tests.
    if (! $this->workspace->hasUser($this->user)) {
        $this->workspace->users()->attach($this->user->id, ['role' => 'owner']);
    }
});

it('can invite a new member to a workspace', function () {
    Notification::fake();

    $email = 'new-user@example.com';
    $invitation = $this->service->invite($this->workspace, $email, 'admin');

    expect($invitation)->toBeInstanceOf(WorkspaceInvitation::class);
    expect($invitation->email)->toBe($email);
    expect($invitation->role)->toBe('admin');
    expect($invitation->workspace_id)->toBe($this->workspace->id);

    Notification::assertSentOnDemand(TeamInvitationNotification::class, function ($notification, $channels, $notifiable) use ($email) {
        return $notifiable->routes['mail'] === $email;
    });
});

it('updates existing invitation if already invited', function () {
    Notification::fake();

    $email = 'repeat@example.com';
    $this->service->invite($this->workspace, $email, 'member');
    $invitation = $this->service->invite($this->workspace, $email, 'admin');

    expect($invitation->role)->toBe('admin');
});

it('throws exception if user is already a member', function () {
    $member = User::factory()->create();
    $this->workspace->users()->attach($member->id, ['role' => 'member']);

    $this->service->invite($this->workspace, $member->email);
})->throws(\InvalidArgumentException::class, 'This user is already a member of the workspace.');

it('can accept an invitation', function () {
    $invitedUser = User::factory()->create();
    $invitation = WorkspaceInvitation::create([
        'workspace_id' => $this->workspace->id,
        'email' => $invitedUser->email,
        'role' => 'member',
    ]);

    $result = $this->service->accept($invitation, $invitedUser);

    expect($result)->toBeTrue();
    expect($invitedUser->fresh()->belongsToWorkspace($this->workspace))->toBeTrue();
    expect($invitedUser->fresh()->current_workspace_id)->toBe($this->workspace->id);
    expect(WorkspaceInvitation::find($invitation->id))->toBeNull();
});

it('determines if a workspace can invite more members', function () {
    $limit = config('billing.plans.free.limits.team_members'); // 2

    // currently 1 (owner)
    expect($this->service->canInvite($this->workspace))->toBeTrue();

    // add 1 more = 2 (limit reached)
    $user = User::factory()->create();
    $this->workspace->addUser($user, 'member');

    expect($this->service->canInvite($this->workspace))->toBeFalse();
});
