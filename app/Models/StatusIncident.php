<?php

namespace App\Models;

use Database\Factories\StatusIncidentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StatusIncident extends Model
{
    /** @use HasFactory<StatusIncidentFactory> */
    use HasFactory;

    /**
     * Status constants.
     */
    public const STATUS_OPERATIONAL = 'operational';

    public const STATUS_DEGRADED = 'degraded';

    public const STATUS_OUTAGE = 'outage';

    public const STATUS_MAINTENANCE = 'maintenance';

    public const STATUSES = [
        self::STATUS_OPERATIONAL,
        self::STATUS_DEGRADED,
        self::STATUS_OUTAGE,
        self::STATUS_MAINTENANCE,
    ];

    /**
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'message',
        'status',
        'resolved_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'resolved_at' => 'datetime',
        ];
    }

    /**
     * Scope to incidents created within the last 90 days.
     */
    public function scopeRecent($query): mixed
    {
        return $query->where('created_at', '>=', now()->subDays(90));
    }

    /**
     * Determine whether this incident has been resolved.
     */
    public function isResolved(): bool
    {
        return $this->resolved_at !== null;
    }

    /**
     * Determine whether this incident is still active (unresolved).
     */
    public function isActive(): bool
    {
        return $this->resolved_at === null && $this->status !== self::STATUS_OPERATIONAL;
    }
}
