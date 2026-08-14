<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExperienceFeedbackRequest;
use App\Models\Feedback;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ExperienceFeedbackController extends Controller
{
    public function store(StoreExperienceFeedbackRequest $request): RedirectResponse
    {
        $user = $request->user();

        abort_if($user->experience_feedback_at !== null, 403);

        Feedback::create([
            'user_id' => $user->id,
            'workspace_id' => $user->current_workspace_id,
            'type' => 'experience',
            'message' => $request->validated('message'),
            'page_url' => $this->safePageUrl($request->header('Referer')),
            'user_agent' => $request->userAgent(),
            'metadata' => ['rating' => $request->validated('rating')],
        ]);

        $user->update(['experience_feedback_at' => now()]);

        return back()->with('success', 'Thanks for sharing your feedback!');
    }

    public function dismiss(Request $request): RedirectResponse
    {
        $user = $request->user();

        abort_if($user->experience_feedback_at !== null, 403);

        $user->update(['experience_feedback_at' => now()]);

        return back();
    }

    /**
     * Only persist a client-supplied URL when it uses an http(s) scheme, so an attacker
     * cannot plant a `javascript:` (or similar) URL that is later rendered as a link in admin.
     */
    private function safePageUrl(?string $url): ?string
    {
        if (is_string($url) && preg_match('#^https?://#i', $url) === 1) {
            return $url;
        }

        return null;
    }
}
