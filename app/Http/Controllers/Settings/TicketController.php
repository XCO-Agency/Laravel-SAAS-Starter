<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    /**
     * Display a listing of the user's tickets.
     */
    public function index(Request $request): Response
    {
        $tickets = $request->user()->tickets()
            ->withCount('replies')
            ->latest()
            ->paginate(15);

        return Inertia::render('settings/tickets/index', [
            'tickets' => $tickets,
        ]);
    }

    /**
     * Store a newly created ticket.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'priority' => ['required', 'in:low,normal,high,urgent'],
        ]);

        $ticket = $request->user()->tickets()->create([
            'subject' => $validated['subject'],
            'priority' => $validated['priority'],
            'workspace_id' => $request->user()->current_workspace_id,
        ]);

        $ticket->replies()->create([
            'user_id' => $request->user()->id,
            'content' => $validated['content'],
        ]);

        return redirect()->route('settings.tickets.show', $ticket)
            ->with('success', 'Support ticket created successfully.');
    }

    /**
     * Display the specified ticket.
     */
    public function show(Request $request, Ticket $ticket): Response
    {
        if ($ticket->user_id !== $request->user()->id) {
            abort(403);
        }

        $ticket->load(['replies.user:id,name,avatar_url']);

        return Inertia::render('settings/tickets/show', [
            'ticket' => $ticket,
        ]);
    }

    /**
     * Store a new reply for the ticket.
     */
    public function storeReply(Request $request, Ticket $ticket)
    {
        if ($ticket->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'content' => ['required', 'string'],
        ]);

        $ticket->replies()->create([
            'user_id' => $request->user()->id,
            'content' => $validated['content'],
        ]);

        // Automatically reopen the ticket if a user replies and it was resolved or closed
        if (in_array($ticket->status, ['resolved', 'closed'])) {
            $ticket->update(['status' => 'open']);
        }

        return back()->with('success', 'Reply submitted successfully.');
    }
}
