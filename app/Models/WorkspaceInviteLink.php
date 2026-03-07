<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class WorkspaceInviteLink extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'workspace_id',
        'created_by',
        'token',
        'role',
        'max_uses',
        'uses_count',
        'expires_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'max_uses' => 'integer',
            'uses_count' => 'integer',
            'expires_at' => 'datetime',
        ];
    }

    /**
     * Get the workspace this link belongs to.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Get the user who created this link.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Determine if the link has expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    /**
     * Determine if the link has reached its maximum uses.
     */
    public function isExhausted(): bool
    {
        return $this->max_uses !== null && $this->uses_count >= $this->max_uses;
    }

    /**
     * Determine if the link is currently usable.
     */
    public function isUsable(): bool
    {
        return ! $this->isExpired() && ! $this->isExhausted();
    }

    /**
     * Generate a new invite link for a workspace.
     */
    public static function generateLink(Workspace $workspace, User $creator, string $role = Workspace::ROLE_MEMBER, ?int $maxUses = null, ?\DateTimeInterface $expiresAt = null): static
    {
        return static::create([
            'workspace_id' => $workspace->id,
            'created_by' => $creator->id,
            'token' => Str::random(64),
            'role' => $role,
            'max_uses' => $maxUses,
            'expires_at' => $expiresAt,
        ]);
    }

    /**
     * Increment the usage counter.
     */
    public function incrementUses(): void
    {
        $this->increment('uses_count');
    }
}
