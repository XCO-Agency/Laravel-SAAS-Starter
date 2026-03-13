<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WeeklyWorkspaceDigestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @param  array<int, array{description: string, created_at: string}>  $recentEvents
     */
    public function __construct(
        public readonly string $workspaceName,
        public readonly int $memberCount,
        public readonly int $memberDelta,
        public readonly int $activityCount,
        public readonly array $recentEvents,
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        if (! method_exists($notifiable, 'notificationCategoryEnabled') || ! $notifiable->notificationCategoryEnabled('team')) {
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
        $deltaLabel = match (true) {
            $this->memberDelta > 0 => "+{$this->memberDelta} new member".($this->memberDelta > 1 ? 's' : ''),
            $this->memberDelta < 0 => "{$this->memberDelta} member".($this->memberDelta < -1 ? 's' : ''),
            default => 'no membership changes',
        };

        $mail = (new MailMessage)
            ->subject("Weekly Digest: {$this->workspaceName}")
            ->greeting("Hi {$notifiable->name},")
            ->line("Here is your weekly activity summary for **{$this->workspaceName}**.")
            ->line("**Team:** {$this->memberCount} member".($this->memberCount !== 1 ? 's' : '')." ({$deltaLabel} this week)")
            ->line("**Activity:** {$this->activityCount} event".($this->activityCount !== 1 ? 's' : '').' in the last 7 days');

        if (! empty($this->recentEvents)) {
            $mail->line('**Recent events:**');
            foreach ($this->recentEvents as $event) {
                $mail->line("— {$event['description']} ({$event['created_at']})");
            }
        }

        return $mail
            ->action('View Workspace', url('/dashboard'))
            ->line('You are receiving this digest because you are a member of this workspace. Manage your notification preferences in your account settings.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => "Weekly Digest: {$this->workspaceName}",
            'message' => "{$this->activityCount} event".($this->activityCount !== 1 ? 's' : '')." this week · {$this->memberCount} member".($this->memberCount !== 1 ? 's' : ''),
            'workspace_name' => $this->workspaceName,
            'member_count' => $this->memberCount,
            'activity_count' => $this->activityCount,
        ];
    }
}
