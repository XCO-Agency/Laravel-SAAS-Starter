<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityReaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'activity_id',
        'user_id',
        'reaction',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForActivity($query, int $activityId)
    {
        return $query->where('activity_id', $activityId);
    }

    public function scopeWithReaction($query, string $reaction)
    {
        return $query->where('reaction', $reaction);
    }

    /**
     * Get grouped reactions with counts for an activity
     */
    public static function getGroupedForActivity(int $activityId): array
    {
        return self::where('activity_id', $activityId)
            ->selectRaw('reaction, COUNT(*) as count, GROUP_CONCAT(user_id) as user_ids')
            ->groupBy('reaction')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => [
                'reaction' => $row->reaction,
                'count' => (int) $row->count,
                'user_ids' => array_map('intval', explode(',', $row->user_ids)),
            ])
            ->toArray();
    }

    /**
     * Check if a user has reacted with a specific emoji
     */
    public static function hasUserReacted(int $activityId, int $userId, string $reaction): bool
    {
        return self::where('activity_id', $activityId)
            ->where('user_id', $userId)
            ->where('reaction', $reaction)
            ->exists();
    }

    /**
     * Toggle a reaction for a user
     */
    public static function toggle(int $activityId, int $userId, string $reaction): bool
    {
        $existing = self::where('activity_id', $activityId)
            ->where('user_id', $userId)
            ->where('reaction', $reaction)
            ->first();

        if ($existing) {
            $existing->delete();

            return false; // Reaction removed
        }

        self::create([
            'activity_id' => $activityId,
            'user_id' => $userId,
            'reaction' => $reaction,
        ]);

        return true; // Reaction added
    }
}
