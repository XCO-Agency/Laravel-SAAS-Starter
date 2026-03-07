<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TrialEndingNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public string $workspaceName,
        public int $daysRemaining,
    ) {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $billingEnabled = method_exists($notifiable, 'notificationCategoryEnabled')
            ? $notifiable->notificationCategoryEnabled('billing')
            : ($notifiable->notification_preferences['billing'] ?? true);

        if (! $billingEnabled) {
            return [];
        }

        $channels = [];

        $emailEnabled = method_exists($notifiable, 'notificationChannelEnabled')
            ? $notifiable->notificationChannelEnabled('email')
            : true;

        $inAppEnabled = method_exists($notifiable, 'notificationChannelEnabled')
            ? $notifiable->notificationChannelEnabled('in_app')
            : true;

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
        $subject = $this->daysRemaining <= 1
            ? "Your trial for {$this->workspaceName} expires tomorrow"
            : "Your trial for {$this->workspaceName} expires in {$this->daysRemaining} days";

        return (new MailMessage)
            ->subject($subject)
            ->greeting("Hello {$notifiable->name}!")
            ->line("Your free trial for **{$this->workspaceName}** is ending in {$this->daysRemaining} ".($this->daysRemaining === 1 ? 'day' : 'days').'.')
            ->line('Upgrade now to keep all your data and continue using premium features without interruption.')
            ->action('Upgrade Now', url('/billing/plans'))
            ->line('If you have any questions about our plans, feel free to reach out to our support team.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Trial Ending Soon',
            'message' => "Your trial for {$this->workspaceName} expires in {$this->daysRemaining} ".($this->daysRemaining === 1 ? 'day' : 'days').'. Upgrade to keep premium features.',
            'action_url' => '/billing/plans',
            'workspace_name' => $this->workspaceName,
            'days_remaining' => $this->daysRemaining,
        ];
    }
}
