<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkspaceComment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'workspace_id',
        'user_id',
        'parent_id',
        'commentable_type',
        'commentable_id',
        'content',
        'resolved_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('created_at');
    }

    public function commentable()
    {
        return $this->morphTo();
    }

    public function scopeRootComments($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeForCommentable($query, $commentableType, $commentableId)
    {
        return $query->where('commentable_type', $commentableType)
            ->where('commentable_id', $commentableId);
    }

    public function scopeResolved($query)
    {
        return $query->whereNotNull('resolved_at');
    }

    public function scopeUnresolved($query)
    {
        return $query->whereNull('resolved_at');
    }

    public function isResolved(): bool
    {
        return $this->resolved_at !== null;
    }

    public function scopeWithReplies($query)
    {
        return $query->with(['replies.user', 'replies.replies']);
    }

    /**
     * Extract @mentions from content
     *
     * @return array<string>
     */
    public function extractMentions(): array
    {
        preg_match_all('/@([a-zA-Z0-9_-]+)/', $this->content, $matches);

        return $matches[1] ?? [];
    }

    /**
     * Check if content contains mentions
     */
    public function hasMentions(): bool
    {
        return count($this->extractMentions()) > 0;
    }
}
