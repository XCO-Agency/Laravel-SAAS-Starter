<?php

namespace App\Console\Commands;

use App\Models\BillingReminderLog;
use App\Models\Workspace;
use App\Notifications\SubscriptionRenewalNotification;
use App\Notifications\TrialEndingNotification;
use Illuminate\Console\Command;

class SendBillingReminders extends Command
{
    /** @var string */
    protected $signature = 'app:send-billing-reminders
                            {--dry-run : Show what would be sent without actually sending}';

    /** @var string */
    protected $description = 'Send proactive billing reminders for trial endings and subscription renewals';

    /**
     * Days before trial end to send a reminder.
     */
    private const TRIAL_REMINDER_DAYS = 3;

    /**
     * Days before renewal to send a reminder.
     */
    private const RENEWAL_REMINDER_DAYS = 7;

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->components->warn('DRY RUN — no reminders will be sent.');
        }

        $trialCount = $this->sendTrialReminders($dryRun);
        $renewalCount = $this->sendRenewalReminders($dryRun);

        $this->components->info("Billing reminders processed: {$trialCount} trial, {$renewalCount} renewal.");

        return self::SUCCESS;
    }

    /**
     * Send reminders to workspace owners whose trial is ending soon.
     */
    private function sendTrialReminders(bool $dryRun): int
    {
        $count = 0;

        // Find workspaces with trial ending within the next TRIAL_REMINDER_DAYS days
        $workspaces = Workspace::query()
            ->whereNotNull('trial_ends_at')
            ->where('trial_ends_at', '>', now())
            ->where('trial_ends_at', '<=', now()->addDays(self::TRIAL_REMINDER_DAYS))
            ->with('owner')
            ->get();

        foreach ($workspaces as $workspace) {
            $owner = $workspace->owner;

            if (! $owner) {
                continue;
            }

            // Check if already sent
            $alreadySent = BillingReminderLog::query()
                ->where('workspace_id', $workspace->id)
                ->where('user_id', $owner->id)
                ->where('reminder_type', 'trial_ending')
                ->exists();

            if ($alreadySent) {
                continue;
            }

            $daysRemaining = max(1, (int) ceil(now()->floatDiffInDays($workspace->trial_ends_at, false)));

            if ($dryRun) {
                $this->components->twoColumnDetail(
                    "Trial ending: {$workspace->name}",
                    "{$owner->name} ({$daysRemaining} days left)"
                );
            } else {
                $owner->notify(new TrialEndingNotification($workspace->name, $daysRemaining));

                BillingReminderLog::create([
                    'workspace_id' => $workspace->id,
                    'user_id' => $owner->id,
                    'reminder_type' => 'trial_ending',
                ]);
            }

            $count++;
        }

        return $count;
    }

    /**
     * Send reminders to workspace owners whose subscription access is ending soon.
     *
     * In Cashier, `ends_at` is set when a subscription is cancelled — it marks when
     * the remaining access period expires. This reminds owners to resubscribe.
     */
    private function sendRenewalReminders(bool $dryRun): int
    {
        $count = 0;

        // Find workspaces with active subscriptions
        $workspaces = Workspace::query()
            ->whereHas('subscriptions', function ($query) {
                $query->where('stripe_status', 'active')
                    ->whereNotNull('ends_at')
                    ->where('ends_at', '>', now())
                    ->where('ends_at', '<=', now()->addDays(self::RENEWAL_REMINDER_DAYS));
            })
            ->with(['owner', 'subscriptions' => function ($query) {
                $query->where('stripe_status', 'active')
                    ->whereNotNull('ends_at');
            }])
            ->get();

        foreach ($workspaces as $workspace) {
            $owner = $workspace->owner;

            if (! $owner) {
                continue;
            }

            // Check if already sent
            $alreadySent = BillingReminderLog::query()
                ->where('workspace_id', $workspace->id)
                ->where('user_id', $owner->id)
                ->where('reminder_type', 'renewal_upcoming')
                ->exists();

            if ($alreadySent) {
                continue;
            }

            $subscription = $workspace->subscriptions->first();

            if (! $subscription) {
                continue;
            }

            $daysUntilRenewal = max(1, (int) ceil(now()->floatDiffInDays($subscription->ends_at, false)));

            // Resolve plan name
            $planName = $this->resolvePlanName($subscription->stripe_price);

            if ($dryRun) {
                $this->components->twoColumnDetail(
                    "Renewal: {$workspace->name} ({$planName})",
                    "{$owner->name} ({$daysUntilRenewal} days)"
                );
            } else {
                $owner->notify(new SubscriptionRenewalNotification(
                    $workspace->name,
                    $planName,
                    $daysUntilRenewal,
                ));

                BillingReminderLog::create([
                    'workspace_id' => $workspace->id,
                    'user_id' => $owner->id,
                    'reminder_type' => 'renewal_upcoming',
                ]);
            }

            $count++;
        }

        return $count;
    }

    /**
     * Resolve a human-readable plan name from a Stripe price ID.
     */
    private function resolvePlanName(string $priceId): string
    {
        $plans = config('billing.plans', []);

        foreach ($plans as $plan) {
            $monthlyPrice = $plan['stripe_price_id']['monthly'] ?? null;
            $yearlyPrice = $plan['stripe_price_id']['yearly'] ?? null;

            if ($priceId === $monthlyPrice || $priceId === $yearlyPrice) {
                return $plan['name'];
            }
        }

        return 'Premium';
    }
}
