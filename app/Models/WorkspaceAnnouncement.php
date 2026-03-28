<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkspaceAnnouncement extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'workspace_id',
        'user_id',
        'title',
        'content',
        'type',
        'pinned',
        'dismissible',
        'published_at',
        'expires_at',
    ];

    protected $casts = [
        'pinned' => 'boolean',
        'dismissible' => 'boolean',
        'published_at' => 'datetime',
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reads(): HasMany
    {
        return $this->hasMany(WorkspaceAnnouncementRead::class, 'announcement_id');
    }

    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('published_at')
                ->orWhere('published_at', '<=', now());
        })->where(function ($q) {
            $q->whereNull('expires_at')
                ->orWhere('expires_at', '>', now());
        });
    }

    public function scopePublished($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('published_at')
                ->orWhere('published_at', '<=', now());
        });
    }

    public function scopePinned($query)
    {
        return $query->where('pinned', true);
    }

    public function scopeForWorkspace($query, int $workspaceId)
    {
        return $query->where('workspace_id', $workspaceId);
    }

    public function isPublished(): bool
    {
        if ($this->published_at === null) {
            return true;
        }

        return $this->published_at->isPast();
    }

    public function isExpired(): bool
    {
        if ($this->expires_at === null) {
            return false;
        }

        return $this->expires_at->isPast();
    }

    public function isActive(): bool
    {
        return $this->isPublished() && ! $this->isExpired();
    }

    public function markAsReadBy(User $user): void
    {
        $this->reads()->updateOrCreate(
            ['user_id' => $user->id],
            ['read_at' => now()]
        );
    }

    public function isReadBy(User $user): bool
    {
        return $this->reads()
            ->where('user_id', $user->id)
            ->whereNotNull('read_at')
            ->exists();
    }

    public function getTypeStyles(): array
    {
        return match ($this->type) {
            'warning' => [
                'bg' => 'bg-amber-50 dark:bg-amber-950/30',
                'border' => 'border-amber-200 dark:border-amber-800',
                'text' => 'text-amber-900 dark:text-amber-100',
                'icon' => 'alert-triangle',
            ],
            'success' => [
                'bg' => 'bg-emerald-50 dark:bg-emerald-950/30',
                'border' => 'border-emerald-200 dark:border-emerald-800',
                'text' => 'text-emerald-900 dark:text-emerald-100',
                'icon' => 'check-circle',
            ],
            default => [
                'bg' => 'bg-blue-50 dark:bg-blue-950/30',
                'border' => 'border-blue-200 dark:border-blue-800',
                'text' => 'text-blue-900 dark:text-blue-100',
                'icon' => 'info',
            ],
        };
    }
}
