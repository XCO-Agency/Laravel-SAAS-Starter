<?php

namespace App\Notifications;

use App\Models\Workspace;
use App\Models\WorkspaceComment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserMentioned extends Notification
{
    use Queueable;

    public function __construct(
        public WorkspaceComment $comment,
        public Workspace $workspace
    ) {}

    public function via(object $notifiable): array
    {
        $channels = ['database'];

        // Check user preferences for email notifications
        if ($this->shouldSendEmail($notifiable)) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    private function shouldSendEmail(object $notifiable): bool
    {
        $preferences = $notifiable->notification_preferences ?? [];

        // Check if mentions category is enabled for email
        return $preferences['categories']['mentions']['email'] ?? true;
    }

    public function toMail(object $notifiable): MailMessage
    {
        $commenter = $this->comment->user;
        $url = route('dashboard', ['workspace' => $this->workspace->slug]);

        return (new MailMessage)
            ->subject("You were mentioned in {$this->workspace->name}")
            ->greeting("Hi {$notifiable->name},")
            ->line("{$commenter->name} mentioned you in a comment on {$this->workspace->name}:")
            ->line('"'.str_limit($this->comment->content, 150).'"')
            ->action('View Comment', $url)
            ->line('You can reply to this comment directly in the workspace.');
    }

    public function toArray(object $notifiable): array
    {
        $commenter = $this->comment->user;

        return [
            'type' => 'mention',
            'category' => 'mentions',
            'title' => "{$commenter->name} mentioned you",
            'message' => str_limit($this->comment->content, 100),
            'comment_id' => $this->comment->id,
            'workspace_id' => $this->workspace->id,
            'workspace_name' => $this->workspace->name,
            'mentioned_by' => [
                'id' => $commenter->id,
                'name' => $commenter->name,
                'avatar' => $commenter->avatar,
            ],
            'action_url' => route('dashboard', ['workspace' => $this->workspace->slug]),
            'action_text' => 'View Comment',
        ];
    }
}
