<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SubscriptionRenewalNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public string $workspaceName,
        public string $planName,
        public int $daysUntilRenewal,
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
        return (new MailMessage)
            ->subject("Your {$this->planName} plan renews in {$this->daysUntilRenewal} days")
            ->greeting("Hello {$notifiable->name}!")
            ->line("Your **{$this->planName}** subscription for **{$this->workspaceName}** will renew in {$this->daysUntilRenewal} days.")
            ->line('If you need to make changes to your subscription, you can manage it from your billing settings.')
            ->action('Manage Billing', url('/billing'))
            ->line('Thank you for being a valued subscriber!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Subscription Renewal Coming Up',
            'message' => "Your {$this->planName} plan for {$this->workspaceName} renews in {$this->daysUntilRenewal} days.",
            'action_url' => '/billing',
            'workspace_name' => $this->workspaceName,
            'plan_name' => $this->planName,
            'days_until_renewal' => $this->daysUntilRenewal,
        ];
    }
}
