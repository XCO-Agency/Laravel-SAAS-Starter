<?php

use App\Models\BillingReminderLog;
use App\Models\User;
use App\Models\Workspace;
use App\Notifications\SubscriptionRenewalNotification;
use App\Notifications\TrialEndingNotification;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    Notification::fake();
});

describe('Trial Ending Reminders', function () {
    it('sends trial ending notification when trial expires within 3 days', function () {
        $owner = User::factory()->create();
        $workspace = Workspace::factory()->create([
            'owner_id' => $owner->id,
            'trial_ends_at' => now()->addDays(2),
        ]);

        $this->artisan('app:send-billing-reminders')
            ->assertSuccessful();

        Notification::assertSentTo($owner, TrialEndingNotification::class, function ($notification) use ($workspace) {
            return $notification->workspaceName === $workspace->name
                && $notification->daysRemaining === 2;
        });

        $this->assertDatabaseHas('billing_reminder_logs', [
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
            'reminder_type' => 'trial_ending',
        ]);
    });

    it('does not send trial reminders for trials ending beyond 3 days', function () {
        $owner = User::factory()->create();
        Workspace::factory()->create([
            'owner_id' => $owner->id,
            'trial_ends_at' => now()->addDays(5),
        ]);

        $this->artisan('app:send-billing-reminders')
            ->assertSuccessful();

        Notification::assertNotSentTo($owner, TrialEndingNotification::class);
    });

    it('does not send trial reminders for expired trials', function () {
        $owner = User::factory()->create();
        Workspace::factory()->create([
            'owner_id' => $owner->id,
            'trial_ends_at' => now()->subDay(),
        ]);

        $this->artisan('app:send-billing-reminders')
            ->assertSuccessful();

        Notification::assertNotSentTo($owner, TrialEndingNotification::class);
    });

    it('does not send duplicate trial reminders', function () {
        $owner = User::factory()->create();
        $workspace = Workspace::factory()->create([
            'owner_id' => $owner->id,
            'trial_ends_at' => now()->addDays(2),
        ]);

        BillingReminderLog::create([
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
            'reminder_type' => 'trial_ending',
        ]);

        $this->artisan('app:send-billing-reminders')
            ->assertSuccessful();

        Notification::assertNotSentTo($owner, TrialEndingNotification::class);
    });

    it('does not send trial reminders to workspaces without trial', function () {
        $owner = User::factory()->create();
        Workspace::factory()->create([
            'owner_id' => $owner->id,
            'trial_ends_at' => null,
        ]);

        $this->artisan('app:send-billing-reminders')
            ->assertSuccessful();

        Notification::assertNotSentTo($owner, TrialEndingNotification::class);
    });
});

describe('Subscription Renewal Reminders', function () {
    it('sends renewal notification for cancelled subscription ending within 7 days', function () {
        $owner = User::factory()->create();
        $workspace = Workspace::factory()->create([
            'owner_id' => $owner->id,
        ]);

        // Create a cancelled subscription (has ends_at set)
        $workspace->subscriptions()->create([
            'type' => 'default',
            'stripe_id' => 'sub_test_renewal_'.uniqid(),
            'stripe_status' => 'active',
            'stripe_price' => 'price_pro_monthly',
            'ends_at' => now()->addDays(5),
        ]);

        $this->artisan('app:send-billing-reminders')
            ->assertSuccessful();

        Notification::assertSentTo($owner, SubscriptionRenewalNotification::class, function ($notification) use ($workspace) {
            return $notification->workspaceName === $workspace->name
                && $notification->daysUntilRenewal === 5;
        });

        $this->assertDatabaseHas('billing_reminder_logs', [
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
            'reminder_type' => 'renewal_upcoming',
        ]);
    });

    it('does not send renewal reminders for subscriptions ending beyond 7 days', function () {
        $owner = User::factory()->create();
        $workspace = Workspace::factory()->create([
            'owner_id' => $owner->id,
        ]);

        $workspace->subscriptions()->create([
            'type' => 'default',
            'stripe_id' => 'sub_test_far_'.uniqid(),
            'stripe_status' => 'active',
            'stripe_price' => 'price_pro_monthly',
            'ends_at' => now()->addDays(15),
        ]);

        $this->artisan('app:send-billing-reminders')
            ->assertSuccessful();

        Notification::assertNotSentTo($owner, SubscriptionRenewalNotification::class);
    });

    it('does not send renewal reminders for active subscriptions without ends_at', function () {
        $owner = User::factory()->create();
        $workspace = Workspace::factory()->create([
            'owner_id' => $owner->id,
        ]);

        $workspace->subscriptions()->create([
            'type' => 'default',
            'stripe_id' => 'sub_test_active_'.uniqid(),
            'stripe_status' => 'active',
            'stripe_price' => 'price_pro_monthly',
            'ends_at' => null,
        ]);

        $this->artisan('app:send-billing-reminders')
            ->assertSuccessful();

        Notification::assertNotSentTo($owner, SubscriptionRenewalNotification::class);
    });

    it('does not send duplicate renewal reminders', function () {
        $owner = User::factory()->create();
        $workspace = Workspace::factory()->create([
            'owner_id' => $owner->id,
        ]);

        $workspace->subscriptions()->create([
            'type' => 'default',
            'stripe_id' => 'sub_test_dup_'.uniqid(),
            'stripe_status' => 'active',
            'stripe_price' => 'price_pro_monthly',
            'ends_at' => now()->addDays(5),
        ]);

        BillingReminderLog::create([
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
            'reminder_type' => 'renewal_upcoming',
        ]);

        $this->artisan('app:send-billing-reminders')
            ->assertSuccessful();

        Notification::assertNotSentTo($owner, SubscriptionRenewalNotification::class);
    });
});

describe('Dry Run Mode', function () {
    it('does not send notifications in dry-run mode', function () {
        $owner = User::factory()->create();
        Workspace::factory()->create([
            'owner_id' => $owner->id,
            'trial_ends_at' => now()->addDays(2),
        ]);

        $this->artisan('app:send-billing-reminders', ['--dry-run' => true])
            ->assertSuccessful();

        Notification::assertNotSentTo($owner, TrialEndingNotification::class);
        $this->assertDatabaseCount('billing_reminder_logs', 0);
    });
});

describe('Notification Content', function () {
    it('trial ending notification renders correct mail content', function () {
        $user = User::factory()->create();
        $notification = new TrialEndingNotification('Acme Corp', 3);
        $mail = $notification->toMail($user);

        expect($mail->subject)->toContain('Acme Corp')
            ->and($mail->subject)->toContain('3 days')
            ->and($mail->actionUrl)->toContain('/billing/plans');
    });

    it('trial ending notification uses singular day for 1 day remaining', function () {
        $user = User::factory()->create();
        $notification = new TrialEndingNotification('Acme Corp', 1);
        $mail = $notification->toMail($user);

        expect($mail->subject)->toContain('expires tomorrow');
    });

    it('subscription renewal notification renders correct mail content', function () {
        $user = User::factory()->create();
        $notification = new SubscriptionRenewalNotification('Acme Corp', 'Pro', 7);
        $mail = $notification->toMail($user);

        expect($mail->subject)->toContain('Pro')
            ->and($mail->subject)->toContain('7 days')
            ->and($mail->actionUrl)->toContain('/billing');
    });

    it('trial ending notification produces correct database payload', function () {
        $user = User::factory()->create();
        $notification = new TrialEndingNotification('Acme Corp', 2);
        $data = $notification->toArray($user);

        expect($data)->toHaveKeys(['title', 'message', 'action_url', 'workspace_name', 'days_remaining'])
            ->and($data['workspace_name'])->toBe('Acme Corp')
            ->and($data['days_remaining'])->toBe(2)
            ->and($data['action_url'])->toBe('/billing/plans');
    });

    it('subscription renewal notification produces correct database payload', function () {
        $user = User::factory()->create();
        $notification = new SubscriptionRenewalNotification('Acme Corp', 'Pro', 7);
        $data = $notification->toArray($user);

        expect($data)->toHaveKeys(['title', 'message', 'action_url', 'workspace_name', 'plan_name', 'days_until_renewal'])
            ->and($data['plan_name'])->toBe('Pro')
            ->and($data['days_until_renewal'])->toBe(7)
            ->and($data['action_url'])->toBe('/billing');
    });
});

describe('Notification Channel Preferences', function () {
    it('respects user billing category opt-out', function () {
        $user = User::factory()->create([
            'notification_preferences' => [
                'channels' => ['email' => true, 'in_app' => true],
                'categories' => ['billing' => false],
            ],
        ]);

        $notification = new TrialEndingNotification('Acme Corp', 3);
        $channels = $notification->via($user);

        expect($channels)->toBeEmpty();
    });

    it('respects user email channel opt-out for billing', function () {
        $user = User::factory()->create([
            'notification_preferences' => [
                'channels' => ['email' => false, 'in_app' => true],
                'categories' => ['billing' => true],
            ],
        ]);

        $notification = new TrialEndingNotification('Acme Corp', 3);
        $channels = $notification->via($user);

        expect($channels)->toBe(['database']);
    });
});

describe('BillingReminderLog Model', function () {
    it('belongs to a workspace', function () {
        $owner = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);

        $log = BillingReminderLog::create([
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
            'reminder_type' => 'trial_ending',
        ]);

        expect($log->workspace)->toBeInstanceOf(Workspace::class)
            ->and($log->workspace->id)->toBe($workspace->id);
    });

    it('belongs to a user', function () {
        $owner = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);

        $log = BillingReminderLog::create([
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
            'reminder_type' => 'trial_ending',
        ]);

        expect($log->user)->toBeInstanceOf(User::class)
            ->and($log->user->id)->toBe($owner->id);
    });
});
