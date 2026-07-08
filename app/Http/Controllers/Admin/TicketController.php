<?php

namespace App\Http\Controllers\Admin;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    /**
     * Display a listing of all global tickets.
     */
    public function index(Request $request): Response
    {
        $query = Ticket::query()->with(['user:id,name,email,avatar_url']);

        if (is_string($request->status) && $status = TicketStatus::tryFrom($request->status)) {
            $query->where('status', $status);
        }

        // Search by subject
        if ($request->filled('search')) {
            $query->where('subject', 'like', '%'.$request->search.'%');
        }

        $tickets = $query
            ->orderByRaw(TicketPriority::sortOrderByRaw())
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/tickets/index', [
            'tickets' => $tickets,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Display the specified ticket for admin view.
     */
    public function show(Ticket $ticket): Response
    {
        $ticket->load(['user:id,name,email,avatar_url', 'workspace:id,name', 'replies.user:id,name,avatar_url']);

        return Inertia::render('admin/tickets/show', [
            'ticket' => $ticket,
        ]);
    }

    /**
     * Update the ticket's status and/or priority.
     */
    public function update(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'status' => ['sometimes', 'required', Rule::enum(TicketStatus::class)],
            'priority' => ['sometimes', 'required', Rule::enum(TicketPriority::class)],
        ]);

        $ticket->update($validated);

        return back()->with('success', 'Ticket updated successfully.');
    }

    /**
     * Store a new admin reply for the ticket.
     */
    public function storeReply(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'content' => ['required', 'string'],
        ]);

        $ticket->replies()->create([
            'user_id' => $request->user()->id,
            'content' => $validated['content'],
            'is_from_admin' => true,
        ]);

        // Default to moving the ticket to 'in_progress' if an admin responds and it was 'open'
        if ($ticket->status === TicketStatus::Open) {
            $ticket->update(['status' => TicketStatus::InProgress]);
        }

        return back()->with('success', 'Reply submitted successfully.');
    }
}
