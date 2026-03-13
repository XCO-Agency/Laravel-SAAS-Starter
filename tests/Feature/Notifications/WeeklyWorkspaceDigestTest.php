<?php

use App\Models\User;
use App\Models\Workspace;
use App\Notifications\WeeklyWorkspaceDigestNotification;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->workspace = Workspace::factory()->create([
        'owner_id' => $this->owner->id,
        'personal_workspace' => false,
    ]);
    $this->workspace->addUser($this->owner, 'owner');
    $this->owner->switchWorkspace($this->workspace);
});

describe('SendWeeklyDigests command', function () {
    it('sends digest notifications to workspace members', function () {
        Notification::fake();

        $member = User::factory()->create();
        $this->workspace->addUser($member, 'member');

        $this->artisan('app:send-weekly-digests')->assertSuccessful();

        Notification::assertSentTo($this->owner, WeeklyWorkspaceDigestNotification::class);
        Notification::assertSentTo($member, WeeklyWorkspaceDigestNotification::class);
    });

    it('does not send any notifications in dry-run mode', function () {
        Notification::fake();

        $member = User::factory()->create();
        $this->workspace->addUser($member, 'member');

        $this->artisan('app:send-weekly-digests', ['--dry-run' => true])->assertSuccessful();

        Notification::assertNothingSent();
    });

    it('outputs the count of queued notifications', function () {
        Notification::fake();

        $member = User::factory()->create();
        $this->workspace->addUser($member, 'member');

        $this->artisan('app:send-weekly-digests')
            ->assertSuccessful()
            ->expectsOutputToContain('notifications queued');
    });
});

describe('WeeklyWorkspaceDigestNotification', function () {
    it('is not sent when team category is disabled', function () {
        Notification::fake();

        $user = User::factory()->create([
            'notification_preferences' => [
                'channels' => ['email' => true, 'in_app' => true],
                'categories' => ['team' => false, 'billing' => true, 'security' => true, 'marketing' => true],
            ],
        ]);

        $notification = new WeeklyWorkspaceDigestNotification(
            workspaceName: 'Acme',
            memberCount: 3,
            memberDelta: 1,
            activityCount: 5,
            recentEvents: [],
        );

        expect($notification->via($user))->toBeEmpty();
    });

    it('respects the email channel preference', function () {
        $user = User::factory()->create([
            'notification_preferences' => [
                'channels' => ['email' => false, 'in_app' => true],
                'categories' => ['team' => true],
            ],
        ]);

        $notification = new WeeklyWorkspaceDigestNotification(
            workspaceName: 'Acme',
            memberCount: 3,
            memberDelta: 0,
            activityCount: 2,
            recentEvents: [],
        );

        $channels = $notification->via($user);
        expect($channels)->not->toContain('mail');
        expect($channels)->toContain('database');
    });

    it('respects the in-app channel preference', function () {
        $user = User::factory()->create([
            'notification_preferences' => [
                'channels' => ['email' => true, 'in_app' => false],
                'categories' => ['team' => true],
            ],
        ]);

        $notification = new WeeklyWorkspaceDigestNotification(
            workspaceName: 'Acme',
            memberCount: 3,
            memberDelta: 0,
            activityCount: 2,
            recentEvents: [],
        );

        $channels = $notification->via($user);
        expect($channels)->toContain('mail');
        expect($channels)->not->toContain('database');
    });

    it('builds a mail message with correct workspace data', function () {
        $user = User::factory()->create([
            'notification_preferences' => [
                'channels' => ['email' => true, 'in_app' => true],
                'categories' => ['team' => true],
            ],
        ]);

        $notification = new WeeklyWorkspaceDigestNotification(
            workspaceName: 'Acme Corp',
            memberCount: 5,
            memberDelta: 2,
            activityCount: 12,
            recentEvents: [['description' => 'updated', 'created_at' => '2 hours ago']],
        );

        $mail = $notification->toMail($user);

        expect($mail->subject)->toBe('Weekly Digest: Acme Corp')
            ->and($mail->introLines)->toContain('Here is your weekly activity summary for **Acme Corp**.');
    });
});
