<?php

namespace App\Mail;

use App\Models\WorkspaceInvitation as WorkspaceInvitationModel;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Spatie\MailTemplates\TemplateMailable;

class WorkspaceInvitation extends TemplateMailable
{
    use Queueable, SerializesModels;

    public string $workspaceName;

    public string $inviterName;

    public string $acceptUrl;

    public string $role;

    /**
     * Create a new message instance.
     */
    public function __construct(WorkspaceInvitationModel $invitation)
    {
        $this->workspaceName = $invitation->workspace->name;
        $this->inviterName = $invitation->workspace->owner->name ?? 'a team member';
        $this->acceptUrl = route('invitations.show', $invitation->token);
        $this->role = ucfirst($invitation->role);
    }
}
