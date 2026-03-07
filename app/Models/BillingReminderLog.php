<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BillingReminderLog extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'workspace_id',
        'user_id',
        'reminder_type',
    ];

    /**
     * Get the workspace that received this reminder.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Get the user who was notified.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
