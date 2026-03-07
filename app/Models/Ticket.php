<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
