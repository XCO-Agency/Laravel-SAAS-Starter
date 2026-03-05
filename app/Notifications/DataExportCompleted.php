<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DataExportCompleted extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public string $downloadUrl)
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $securityEnabled = method_exists($notifiable, 'notificationCategoryEnabled')
            ? $notifiable->notificationCategoryEnabled('security')
            : ($notifiable->notification_preferences['security'] ?? true);

        if (! $securityEnabled) {
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
            ->subject('Your Data Export is Ready')
            ->line('You recently requested an export of your personal data.')
            ->line('Your export is now ready. Click the button below to securely download your ZIP archive.')
            ->action('Download Data Export', $this->downloadUrl)
            ->line('For security purposes, this link will expire in exactly 24 hours. The file will be automatically deleted from our servers afterwards.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Your Data Export is Ready',
            'message' => 'Your personal data export is ready to download for the next 24 hours.',
            'action_url' => $this->downloadUrl,
        ];
    }
}
