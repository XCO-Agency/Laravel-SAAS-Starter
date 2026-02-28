<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SeoMetadata extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'path',
        'title',
        'description',
        'keywords',
        'og_title',
        'og_description',
        'og_image',
        'og_type',
        'twitter_card',
        'twitter_site',
        'twitter_creator',
        'twitter_image',
        'is_global',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_global' => 'boolean',
        ];
    }

    /**
     * Get the SEO metadata for a specific path.
     */
    public static function forPath(string $path): ?self
    {
        // Try exact match
        $metadata = self::where('path', $path)->first();

        if ($metadata) {
            return $metadata;
        }

        // Fallback to global
        return self::where('is_global', true)->first();
    }
}
