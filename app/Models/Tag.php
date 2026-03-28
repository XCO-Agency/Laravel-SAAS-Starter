<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Support\Str;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'color',
        'description',
        'workspace_id',
        'user_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($tag) {
            if (empty($tag->slug)) {
                $tag->slug = Str::slug($tag->name);
            }
        });

        static::updating(function ($tag) {
            if ($tag->isDirty('name') && empty($tag->slug)) {
                $tag->slug = Str::slug($tag->name);
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function workspaces(): MorphToMany
    {
        return $this->morphedByMany(Workspace::class, 'taggable');
    }

    public function scopeForWorkspace($query, ?int $workspaceId)
    {
        return $query->where(function ($q) use ($workspaceId) {
            $q->whereNull('workspace_id')
                ->orWhere('workspace_id', $workspaceId);
        });
    }

    public function scopeGlobal($query)
    {
        return $query->whereNull('workspace_id');
    }

    public function scopeWithColor($query, string $color)
    {
        return $query->where('color', $color);
    }

    public function isGlobal(): bool
    {
        return $this->workspace_id === null;
    }

    public static function getPresetColors(): array
    {
        return [
            '#ef4444' => 'Red',
            '#f97316' => 'Orange',
            '#f59e0b' => 'Amber',
            '#84cc16' => 'Lime',
            '#22c55e' => 'Green',
            '#10b981' => 'Emerald',
            '#14b8a6' => 'Teal',
            '#06b6d4' => 'Cyan',
            '#0ea5e9' => 'Sky',
            '#3b82f6' => 'Blue',
            '#6366f1' => 'Indigo',
            '#8b5cf6' => 'Violet',
            '#a855f7' => 'Purple',
            '#d946ef' => 'Fuchsia',
            '#ec4899' => 'Pink',
            '#f43f5e' => 'Rose',
            '#64748b' => 'Slate',
        ];
    }
}
