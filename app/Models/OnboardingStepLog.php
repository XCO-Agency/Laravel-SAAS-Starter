<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OnboardingStepLog extends Model
{
    /** @var list<string> */
    protected $fillable = [
        'user_id',
        'step',
        'action',
    ];

    /**
     * The user this step log belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
