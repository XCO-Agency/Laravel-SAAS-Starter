<?php

use App\Models\Ticket;
use App\Models\TicketReply;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->create(['is_superadmin' => true]);
});

it('computes the seconds between a ticket and its first reply', function () {
    $ticket = Ticket::factory()->create([
        'created_at' => Carbon::parse('2026-01-01 10:00:00'),
    ]);
    TicketReply::factory()->create([
        'ticket_id' => $ticket->id,
        'created_at' => Carbon::parse('2026-01-01 10:05:00'),
    ]);

    $this->actingAs($this->admin)
        ->get('/admin/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('metrics.avg_first_response_seconds', 300)
        );
});

it('averages the first-response time across tickets', function () {
    $fast = Ticket::factory()->create([
        'created_at' => Carbon::parse('2026-01-01 10:00:00'),
    ]);
    TicketReply::factory()->create([
        'ticket_id' => $fast->id,
        'created_at' => Carbon::parse('2026-01-01 10:05:00'), // 300s
    ]);

    $slow = Ticket::factory()->create([
        'created_at' => Carbon::parse('2026-01-01 10:00:00'),
    ]);
    TicketReply::factory()->create([
        'ticket_id' => $slow->id,
        'created_at' => Carbon::parse('2026-01-01 10:15:00'), // 900s
    ]);

    $this->actingAs($this->admin)
        ->get('/admin/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('metrics.avg_first_response_seconds', 600)
        );
});

it('uses only the earliest reply for a ticket', function () {
    $ticket = Ticket::factory()->create([
        'created_at' => Carbon::parse('2026-01-01 10:00:00'),
    ]);
    TicketReply::factory()->create([
        'ticket_id' => $ticket->id,
        'created_at' => Carbon::parse('2026-01-01 10:05:00'), // first, 300s
    ]);
    TicketReply::factory()->create([
        'ticket_id' => $ticket->id,
        'created_at' => Carbon::parse('2026-01-01 12:00:00'), // later
    ]);

    $this->actingAs($this->admin)
        ->get('/admin/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('metrics.avg_first_response_seconds', 300)
        );
});

it('excludes tickets without a reply from the average', function () {
    $replied = Ticket::factory()->create([
        'created_at' => Carbon::parse('2026-01-01 10:00:00'),
    ]);
    TicketReply::factory()->create([
        'ticket_id' => $replied->id,
        'created_at' => Carbon::parse('2026-01-01 10:10:00'), // 600s
    ]);

    // A ticket with no replies must not drag the average toward 0.
    Ticket::factory()->create([
        'created_at' => Carbon::parse('2026-01-01 10:00:00'),
    ]);

    $this->actingAs($this->admin)
        ->get('/admin/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('metrics.avg_first_response_seconds', 600)
        );
});

it('returns zero when no tickets have replies', function () {
    Ticket::factory()->create();

    $this->actingAs($this->admin)
        ->get('/admin/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('metrics.avg_first_response_seconds', 0)
        );
});
