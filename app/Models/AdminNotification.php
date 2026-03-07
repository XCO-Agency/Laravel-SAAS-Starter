<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminNotification extends Model
{
    /** @use HasFactory<\Database\Factories\AdminNotificationFactory> */
    use HasFactory;

    public const TYPE_WEBHOOK_FAILURE = 'webhook_failure';

    public const TYPE_SUBSCRIPTION_CANCELED = 'subscription_canceled';

    public const TYPE_SUBSCRIPTION_PAST_DUE = 'subscription_past_due';

    public const TYPE_SYSTEM_ERROR = 'system_error';

    public const TYPE_NEW_SIGNUP = 'new_signup';

    public const SEVERITY_INFO = 'info';

    public const SEVERITY_WARNING = 'warning';

    public const SEVERITY_CRITICAL = 'critical';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'type',
        'severity',
        'title',
        'message',
        'metadata',
        'read_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'read_at' => 'datetime',
        ];
    }

    /**
     * Scope: unread notifications.
     */
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    /**
     * Mark the notification as read.
     */
    public function markAsRead(): void
    {
        $this->update(['read_at' => now()]);
    }
}
