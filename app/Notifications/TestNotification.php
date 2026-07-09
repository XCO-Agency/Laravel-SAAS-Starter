<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TestNotification extends Notification
{
    use Queueable;

    /**
     * Get the notification's delivery channels.
     *
     * Derived solely from the notifiable's enabled channels so a manual test
     * verifies exactly the channels the user currently has enabled.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
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
            ->subject('Test Notification')
            ->line('This is a test notification confirming your email notifications are working.')
            ->line('You are receiving this because you triggered a test from your notification settings.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Test Notification',
            'message' => 'This is a test notification confirming your in-app notifications are working.',
        ];
    }
}
