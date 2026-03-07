<?php

namespace App\Listeners;

use App\Models\NotificationDeliveryLog;
use Illuminate\Notifications\Events\NotificationSent;

class LogNotificationDelivery
{
    /**
     * Notification type to category mapping.
     *
     * @var array<string, string>
     */
    protected static array $categoryMap = [
        'App\Notifications\DataExportCompleted' => 'security',
        'App\Notifications\TeamInvitationNotification' => 'team',
        'App\Notifications\MagicLinkNotification' => 'security',
        'App\Notifications\TrialEndingNotification' => 'billing',
        'App\Notifications\SubscriptionRenewalNotification' => 'billing',
    ];

    /**
     * Handle the NotificationSent event.
     */
    public function handle(NotificationSent $event): void
    {
        $notifiable = $event->notifiable;

        // Only track user notifications
        if (! $notifiable instanceof \App\Models\User) {
            return;
        }

        $notificationType = get_class($event->notification);

        NotificationDeliveryLog::create([
            'user_id' => $notifiable->id,
            'notification_type' => class_basename($notificationType),
            'channel' => $this->normalizeChannel($event->channel),
            'category' => static::$categoryMap[$notificationType] ?? null,
            'is_successful' => true,
            'delivered_at' => now(),
        ]);
    }

    /**
     * Normalize channel names for consistent storage.
     */
    protected function normalizeChannel(string $channel): string
    {
        return match ($channel) {
            'mail' => 'email',
            'database' => 'in_app',
            default => $channel,
        };
    }

    /**
     * Register a notification type to a category.
     */
    public static function registerCategory(string $notificationClass, string $category): void
    {
        static::$categoryMap[$notificationClass] = $category;
    }
}
