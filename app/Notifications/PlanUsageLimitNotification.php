<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PlanUsageLimitNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @param  array<int, array{label: string, used: int, limit: int, percent: int}>  $nearLimits
     */
    public function __construct(
        public readonly string $workspaceName,
        public readonly array $nearLimits,
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        if (! method_exists($notifiable, 'notificationCategoryEnabled') || ! $notifiable->notificationCategoryEnabled('billing')) {
            return [];
        }

        $channels = [];

        $emailEnabled = ! method_exists($notifiable, 'notificationChannelEnabled') || $notifiable->notificationChannelEnabled('email');
        $inAppEnabled = ! method_exists($notifiable, 'notificationChannelEnabled') || $notifiable->notificationChannelEnabled('in_app');

        if ($emailEnabled) {
            $channels[] = 'mail';
        }

        if ($inAppEnabled) {
            $channels[] = 'database';
        }

        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject("Plan Usage Alert — {$this->workspaceName}")
            ->greeting('Heads up!')
            ->line("Your workspace **{$this->workspaceName}** is approaching its plan limits:");

        foreach ($this->nearLimits as $limit) {
            $mail->line("• **{$limit['label']}**: {$limit['used']} / {$limit['limit']} used ({$limit['percent']}%)");
        }

        return $mail
            ->action('Manage Billing', url('/billing/plans'))
            ->line('Upgrade your plan to avoid service disruption.');
    }

    /**
     * Get the database representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'workspace_name' => $this->workspaceName,
            'near_limits' => $this->nearLimits,
            'message' => "Your workspace \"{$this->workspaceName}\" is approaching its plan limits.",
        ];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}
