<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkspaceTemplate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'workspace_id',
        'name',
        'description',
        'icon',
        'is_public',
        'configuration',
        'category',
        'usage_count',
    ];

    protected $casts = [
        'configuration' => 'array',
        'is_public' => 'boolean',
        'usage_count' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        });
    }

    public function incrementUsage(): void
    {
        $this->increment('usage_count');
    }

    public function getConfigurationValue(string $key, mixed $default = null): mixed
    {
        return data_get($this->configuration, $key, $default);
    }

    public static function getCategories(): array
    {
        return [
            'general' => 'General',
            'development' => 'Development',
            'marketing' => 'Marketing',
            'sales' => 'Sales',
            'support' => 'Support',
            'design' => 'Design',
            'operations' => 'Operations',
        ];
    }

    public static function getAvailableIcons(): array
    {
        return [
            'building' => 'Building',
            'code' => 'Code',
            'rocket' => 'Rocket',
            'briefcase' => 'Briefcase',
            'palette' => 'Palette',
            'headphones' => 'Headphones',
            'chart-bar' => 'Chart Bar',
            'users' => 'Users',
            'star' => 'Star',
            'zap' => 'Zap',
        ];
    }
}
