<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationDeliveryLog extends Model
{
    /** @var list<string> */
    protected $fillable = [
        'user_id',
        'notification_type',
        'channel',
        'category',
        'is_successful',
        'delivered_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_successful' => 'boolean',
            'delivered_at' => 'datetime',
        ];
    }

    /**
     * The user this delivery log belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
