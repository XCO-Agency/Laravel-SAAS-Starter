<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PasswordHistory extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'ip_address',
        'user_agent',
        'changed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'changed_at' => 'datetime',
        ];
    }

    /**
     * Get the user that changed their password.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
