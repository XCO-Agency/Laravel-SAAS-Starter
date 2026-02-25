<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChangelogEntry extends Model
{
    /** @use HasFactory<\Database\Factories\ChangelogEntryFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'version',
        'title',
        'body',
        'type',
        'is_published',
        'published_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    /**
     * Scope to only published entries.
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
