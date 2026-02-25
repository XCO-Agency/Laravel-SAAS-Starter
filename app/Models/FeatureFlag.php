<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeatureFlag extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'key',
        'name',
        'description',
        'is_global',
        'workspace_ids',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_global' => 'boolean',
            'workspace_ids' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::saved(function () {
            \Illuminate\Support\Facades\Cache::forget('feature_flags_definitions');
            \App\Providers\AppServiceProvider::registerFeatureFlags();
            \Laravel\Pennant\Feature::flushCache();
        });

        static::deleted(function ($flag) {
            \Illuminate\Support\Facades\Cache::forget('feature_flags_definitions');
            \App\Providers\AppServiceProvider::registerFeatureFlags();
            \Laravel\Pennant\Feature::purge($flag->key);
            \Laravel\Pennant\Feature::flushCache();
        });
    }
}
