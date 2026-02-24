<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConnectedAccount extends Model
{
    /**
     * The attributes that aren't mass assignable.
     *
     * @var array<string>|bool
     */
    protected $guarded = [];

    /**
     * Get the user that owns the connected account.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
