<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\DispatchBroadcastMessage;
use App\Models\BroadcastMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BroadcastController extends Controller
{
    /**
     * Display the broadcast messages index.
     */
    public function index(): Response
    {
        $broadcasts = BroadcastMessage::with('sender')
            ->latest()
            ->paginate(15);

        return Inertia::render('admin/broadcasts/index', [
            'broadcasts' => $broadcasts,
        ]);
    }

    /**
     * Store a newly created broadcast message.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'send_via_email' => ['boolean'],
            'send_via_in_app' => ['boolean'],
            'target_segment' => ['required', 'string', 'in:all_users,workspace_owners,super_admins'],
        ]);

        if (empty($validated['send_via_email']) && empty($validated['send_via_in_app'])) {
            return back()->withErrors(['channels' => 'At least one delivery channel (Email or In-App) must be selected.']);
        }

        $broadcast = BroadcastMessage::create([
            ...$validated,
            'sender_id' => $request->user()->id,
            'sent_at' => now(),
        ]);

        DispatchBroadcastMessage::dispatch($broadcast);

        return back()->with('success', 'Broadcast message queued for delivery.');
    }
}
