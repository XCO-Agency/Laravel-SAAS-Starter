<?php

use App\Models\User;
use App\Models\Workspace;
use App\Notifications\PlanUsageLimitNotification;
use App\Services\PlanLimitService;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    // Without a subscription, workspaces default to the free plan (team_members: 2)
    $this->owner = User::factory()->create();
    $this->workspace = Workspace::factory()->create([
        'owner_id' => $this->owner->id,
        'personal_workspace' => false,
    ]);
    $this->workspace->addUser($this->owner, 'owner');
    $this->owner->switchWorkspace($this->workspace);
});

describe('SendPlanUsageAlerts command', function () {
    it('sends a notification when usage is at or above 80%', function () {
        Notification::fake();

        // Free plan has 2 team_members limit; add 2 members (owner + member) = 100%
        $member = User::factory()->create();
        $this->workspace->addUser($member, 'member');

        $this->artisan('app:send-plan-usage-alerts')->assertSuccessful();

        Notification::assertSentTo($this->owner, PlanUsageLimitNotification::class);
    });

    it('does not send a notification when usage is below 80%', function () {
        Notification::fake();

        // Free plan has 2 team_members limit; only the owner is a member (50%)
        $this->artisan('app:send-plan-usage-alerts')->assertSuccessful();

        Notification::assertNothingSent();
    });

    it('does not send any notifications in dry-run mode', function () {
        Notification::fake();

        $member = User::factory()->create();
        $this->workspace->addUser($member, 'member');

        $this->artisan('app:send-plan-usage-alerts', ['--dry-run' => true])->assertSuccessful();

        Notification::assertNothingSent();
    });

    it('outputs the count of workspaces notified', function () {
        Notification::fake();

        $member = User::factory()->create();
        $this->workspace->addUser($member, 'member');

        $this->artisan('app:send-plan-usage-alerts')
            ->assertSuccessful()
            ->expectsOutputToContain('workspace(s) notified');
    });

    it('skips workspaces when all limits are unlimited (-1)', function () {
        Notification::fake();

        $this->mock(PlanLimitService::class, function ($mock) {
            $mock->shouldReceive('getLimits')->andReturn([
                'workspaces' => -1,
                'team_members' => -1,
                'api_keys' => -1,
                'webhooks' => -1,
            ]);
        });

        $member = User::factory()->create();
        $this->workspace->addUser($member, 'member');

        $this->artisan('app:send-plan-usage-alerts')->assertSuccessful();

        Notification::assertNothingSent();
    });
});

describe('PlanUsageLimitNotification', function () {
    it('is not sent when billing category is disabled', function () {
        $user = User::factory()->create([
            'notification_preferences' => [
                'channels' => ['email' => true, 'in_app' => true],
                'categories' => ['billing' => false, 'team' => true, 'security' => true, 'marketing' => true],
            ],
        ]);

        $notification = new PlanUsageLimitNotification(
            workspaceName: 'Acme',
            nearLimits: [['label' => 'Team Members', 'used' => 2, 'limit' => 2, 'percent' => 100]],
        );

        expect($notification->via($user))->toBeEmpty();
    });

    it('respects the email channel preference', function () {
        $user = User::factory()->create([
            'notification_preferences' => [
                'channels' => ['email' => false, 'in_app' => true],
                'categories' => ['billing' => true],
            ],
        ]);

        $notification = new PlanUsageLimitNotification(
            workspaceName: 'Acme',
            nearLimits: [['label' => 'Team Members', 'used' => 2, 'limit' => 2, 'percent' => 100]],
        );

        $channels = $notification->via($user);
        expect($channels)->not->toContain('mail');
        expect($channels)->toContain('database');
    });

    it('respects the in-app channel preference', function () {
        $user = User::factory()->create([
            'notification_preferences' => [
                'channels' => ['email' => true, 'in_app' => false],
                'categories' => ['billing' => true],
            ],
        ]);

        $notification = new PlanUsageLimitNotification(
            workspaceName: 'Acme',
            nearLimits: [['label' => 'Team Members', 'used' => 2, 'limit' => 2, 'percent' => 100]],
        );

        $channels = $notification->via($user);
        expect($channels)->toContain('mail');
        expect($channels)->not->toContain('database');
    });

    it('builds a mail message with the workspace name in the subject', function () {
        $user = User::factory()->create([
            'notification_preferences' => [
                'channels' => ['email' => true, 'in_app' => true],
                'categories' => ['billing' => true],
            ],
        ]);

        $notification = new PlanUsageLimitNotification(
            workspaceName: 'Acme Corp',
            nearLimits: [['label' => 'Team Members', 'used' => 2, 'limit' => 2, 'percent' => 100]],
        );

        $mail = $notification->toMail($user);

        expect($mail->subject)->toBe('Plan Usage Alert — Acme Corp');
    });
});
