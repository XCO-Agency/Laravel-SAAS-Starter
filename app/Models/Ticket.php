<?php

namespace App\Models;

use App\Enums\TicketPriority;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array<string>|bool
     */
    protected $guarded = [];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'priority' => TicketPriority::class,
        ];
    }

    /**
     * The user who created the ticket.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The workspace context of the ticket, if any.
     */
    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * The replies on this ticket.
     */
    public function replies()
    {
        return $this->hasMany(TicketReply::class);
    }
}
