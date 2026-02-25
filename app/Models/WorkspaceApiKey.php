<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class WorkspaceApiKey extends Model
{
    /** @use HasFactory<\Database\Factories\WorkspaceApiKeyFactory> */
    use HasFactory;

    /**
     * Available scopes for workspace API keys.
     */
    public const AVAILABLE_SCOPES = [
        'read',
        'write',
        'webhooks',
        'team:read',
        'billing:read',
    ];

    /**
     * @var list<string>
     */
    protected $fillable = [
        'workspace_id',
        'created_by',
        'name',
        'key_hash',
        'key_prefix',
        'scopes',
        'last_used_at',
        'expires_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'scopes' => 'array',
            'last_used_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    /**
     * Get the workspace that owns this key.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Get the user who created this key.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Generate a new API key, store its hash, and return the plain-text key.
     */
    public static function generateKey(Workspace $workspace, User $creator, string $name, array $scopes = [], ?\DateTimeInterface $expiresAt = null): array
    {
        $plainText = 'wsk_'.Str::random(40);

        $key = static::create([
            'workspace_id' => $workspace->id,
            'created_by' => $creator->id,
            'name' => $name,
            'key_hash' => hash('sha256', $plainText),
            'key_prefix' => substr($plainText, 0, 8),
            'scopes' => $scopes,
            'expires_at' => $expiresAt,
        ]);

        return ['key' => $key, 'plainTextKey' => $plainText];
    }

    /**
     * Determine if the key has expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    /**
     * Determine if the key has a given scope.
     */
    public function hasScope(string $scope): bool
    {
        $scopes = $this->scopes ?? [];

        return in_array($scope, $scopes) || in_array('*', $scopes);
    }

    /**
     * Record the last-used timestamp.
     */
    public function recordUsage(): void
    {
        $this->update(['last_used_at' => now()]);
    }
}
