<?php

namespace App\Notifications;

use App\Models\BroadcastMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PlatformBroadcast extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public BroadcastMessage $broadcast)
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
        $channels = [];

        // Note: Broadcasts typically fall under a 'system' or 'marketing' category.
        // We'll use 'marketing' as it is a broadcast, but allow users to opt-out.
        $marketingEnabled = method_exists($notifiable, 'notificationCategoryEnabled')
            ? $notifiable->notificationCategoryEnabled('marketing')
            : ($notifiable->notification_preferences['marketing'] ?? true);

        if (! $marketingEnabled) {
            return [];
        }

        $emailEnabled = method_exists($notifiable, 'notificationChannelEnabled')
            ? $notifiable->notificationChannelEnabled('email')
            : true;

        $inAppEnabled = method_exists($notifiable, 'notificationChannelEnabled')
            ? $notifiable->notificationChannelEnabled('in_app')
            : true;

        if ($this->broadcast->send_via_email && $emailEnabled) {
            $channels[] = 'mail';
        }

        if ($this->broadcast->send_via_in_app && $inAppEnabled) {
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
            ->subject($this->broadcast->subject)
            ->line($this->broadcast->body);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->broadcast->subject,
            'message' => $this->broadcast->body,
        ];
    }
}
