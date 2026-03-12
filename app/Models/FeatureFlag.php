<?php

namespace App\Models;

use App\Providers\AppServiceProvider;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Laravel\Pennant\Feature;

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
            Cache::forget('feature_flags_definitions');
            AppServiceProvider::registerFeatureFlags();
            Feature::flushCache();
        });

        static::deleted(function ($flag) {
            Cache::forget('feature_flags_definitions');
            AppServiceProvider::registerFeatureFlags();
            Feature::purge($flag->key);
            Feature::flushCache();
        });
    }
}
