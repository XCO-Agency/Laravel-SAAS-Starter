<?php

namespace App\Services;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceComment;
use App\Notifications\UserMentioned;

class MentionService
{
    /**
     * Extract @mentions from content
     *
     * @return array<int, string> Array of usernames
     */
    public function extractMentions(string $content): array
    {
        preg_match_all('/@([a-zA-Z0-9_-]+)/', $content, $matches);

        return array_unique($matches[1] ?? []);
    }

    /**
     * Find users by their usernames/handles
     *
     * @param  array<string>  $usernames
     * @return array<int, User>
     */
    public function findUsersByUsername(array $usernames, Workspace $workspace): array
    {
        if (empty($usernames)) {
            return [];
        }

        // Find users that belong to this workspace with matching names/emails
        return User::whereIn('name', $usernames)
            ->orWhereIn('email', array_map(fn ($u) => $u.'@%', $usernames))
            ->whereHas('workspaces', function ($query) use ($workspace) {
                $query->where('workspaces.id', $workspace->id);
            })
            ->get()
            ->all();
    }

    /**
     * Process mentions in a comment and send notifications
     */
    public function processMentions(WorkspaceComment $comment, Workspace $workspace): void
    {
        $mentions = $this->extractMentions($comment->content);

        if (empty($mentions)) {
            return;
        }

        $users = $this->findUsersByUsername($mentions, $workspace);

        foreach ($users as $user) {
            // Don't notify the comment author
            if ($user->id === $comment->user_id) {
                continue;
            }

            $user->notify(new UserMentioned($comment, $workspace));
        }
    }

    /**
     * Parse content and replace mentions with user links
     */
    public function parseMentions(string $content, Workspace $workspace): string
    {
        $mentions = $this->extractMentions($content);

        if (empty($mentions)) {
            return $content;
        }

        $users = $this->findUsersByUsername($mentions, $workspace);
        $userMap = collect($users)->keyBy('name');

        foreach ($mentions as $username) {
            if ($user = $userMap->get($username)) {
                $link = "<a href=\"/users/{$user->id}\" class=\"mention-link\">@{$username}</a>";
                $content = preg_replace('/@'.preg_quote($username, '/').'(?!\w)/', $link, $content);
            }
        }

        return $content;
    }

    /**
     * Render content with mentions as HTML
     */
    public function renderContent(string $content, Workspace $workspace): string
    {
        // First parse mentions
        $content = $this->parseMentions($content, $workspace);

        // Convert newlines to <br> tags
        $content = nl2br(e($content), false);

        return $content;
    }
}
