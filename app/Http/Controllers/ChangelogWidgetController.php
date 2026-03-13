<?php

namespace App\Http\Controllers;

use App\Models\ChangelogEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChangelogWidgetController extends Controller
{
    /**
     * Return the latest changelog entries for the widget.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $entries = ChangelogEntry::published()
            ->latest('published_at')
            ->take(5)
            ->get(['id', 'version', 'title', 'body', 'type', 'published_at'])
            ->map(fn ($entry) => [
                'id' => $entry->id,
                'version' => $entry->version,
                'title' => $entry->title,
                'body' => $entry->body,
                'type' => $entry->type,
                'published_at' => $entry->published_at?->toISOString(),
            ]);

        $latestPublishedAt = ChangelogEntry::published()->latest('published_at')->value('published_at');
        $hasUnread = $latestPublishedAt && (
            is_null($user->changelog_read_at) ||
            $user->changelog_read_at->lt($latestPublishedAt)
        );

        return response()->json([
            'entries' => $entries,
            'has_unread' => $hasUnread,
        ]);
    }

    /**
     * Mark all changelog entries as read for the authenticated user.
     */
    public function markRead(Request $request): JsonResponse
    {
        $request->user()->update(['changelog_read_at' => now()]);

        return response()->json(['success' => true]);
    }
}
