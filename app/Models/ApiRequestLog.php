<?php

namespace App\Models;

use Database\Factories\ApiRequestLogFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiRequestLog extends Model
{
    /** @use HasFactory<ApiRequestLogFactory> */
    use HasFactory;

    public $timestamps = false;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'workspace_id',
        'api_key_id',
        'method',
        'path',
        'status_code',
        'response_time_ms',
        'was_throttled',
        'ip_address',
        'requested_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'was_throttled' => 'boolean',
            'requested_at' => 'datetime',
        ];
    }

    /**
     * Get the workspace that owns this log.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Get the API key that made this request.
     */
    public function apiKey(): BelongsTo
    {
        return $this->belongsTo(WorkspaceApiKey::class, 'api_key_id');
    }
}
