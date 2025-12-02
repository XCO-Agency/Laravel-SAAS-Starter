<?php

namespace App\Notifications;

use App\Models\User;
use App\Models\WorkspaceInvitation;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TeamInvitationNotification extends Notification
{
    /**
     * Create a new notification instance.
     */
    public function __construct(
        public WorkspaceInvitation $invitation
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $workspace = $this->invitation->workspace;
        $role = ucfirst($this->invitation->role);
        $acceptUrl = route('invitations.show', $this->invitation->token);
        $hasExistingAccount = User::where('email', $this->invitation->email)->exists();

        $mail = (new MailMessage)
            ->subject(__('notifications.invitation.subject', ['workspace' => $workspace->name]))
            ->greeting(__('notifications.invitation.greeting'))
            ->line(__('notifications.invitation.intro', [
                'workspace' => $workspace->name,
                'role' => $role,
            ]));

        if ($hasExistingAccount) {
            $mail->line(__('notifications.invitation.existing_account', [
                'email' => $this->invitation->email,
            ]));
        } else {
            $mail->line(__('notifications.invitation.new_account'));
        }

        return $mail
            ->action(__('notifications.invitation.action'), $acceptUrl)
            ->line(__('notifications.invitation.expires', [
                'date' => $this->invitation->expires_at->format('F j, Y'),
            ]))
            ->line(__('notifications.invitation.ignore'));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'invitation_id' => $this->invitation->id,
            'workspace_id' => $this->invitation->workspace_id,
            'workspace_name' => $this->invitation->workspace->name,
            'role' => $this->invitation->role,
        ];
    }
}
