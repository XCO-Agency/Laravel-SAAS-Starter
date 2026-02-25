<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Feedback::query()
            ->with(['user:id,name,email', 'workspace:id,name'])
            ->latest();

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return Inertia::render('admin/feedback', [
            'feedback' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['type', 'status']),
            'counts' => [
                'new' => Feedback::where('status', 'new')->count(),
                'reviewed' => Feedback::where('status', 'reviewed')->count(),
                'archived' => Feedback::where('status', 'archived')->count(),
            ],
        ]);
    }

    public function update(Request $request, Feedback $feedback): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'string', 'in:new,reviewed,archived'],
        ]);

        $feedback->update(['status' => $request->status]);

        return back();
    }

    public function destroy(Feedback $feedback): RedirectResponse
    {
        $feedback->delete();

        return back();
    }
}
