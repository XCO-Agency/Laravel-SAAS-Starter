<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ApiKeyExpiryNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $workspaceName,
        public readonly string $keyName,
        public readonly int $daysUntilExpiry,
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        if (method_exists($notifiable, 'notificationCategoryEnabled') && ! $notifiable->notificationCategoryEnabled('security')) {
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
        $subject = $this->daysUntilExpiry === 0
            ? "API Key Expiring Today — {$this->workspaceName}"
            : "API Key Expiring in {$this->daysUntilExpiry} Day(s) — {$this->workspaceName}";

        $line = $this->daysUntilExpiry === 0
            ? "Your API key **{$this->keyName}** in workspace **{$this->workspaceName}** expires **today**."
            : "Your API key **{$this->keyName}** in workspace **{$this->workspaceName}** will expire in **{$this->daysUntilExpiry} day(s)**.";

        return (new MailMessage)
            ->subject($subject)
            ->greeting('Action Required')
            ->line($line)
            ->action('Manage API Keys', url('/workspaces/api-keys'))
            ->line('Renew or rotate the key before it expires to avoid service disruption.');
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
            'key_name' => $this->keyName,
            'days_until_expiry' => $this->daysUntilExpiry,
            'message' => "API key \"{$this->keyName}\" in \"{$this->workspaceName}\" expires in {$this->daysUntilExpiry} day(s).",
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}
