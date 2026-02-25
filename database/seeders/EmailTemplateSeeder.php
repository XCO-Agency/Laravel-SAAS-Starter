<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\MailTemplates\Models\MailTemplate;

class EmailTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        MailTemplate::firstOrCreate(
            ['mailable' => \App\Mail\WorkspaceInvitation::class],
            [
                'subject' => 'You have been invited to join {{ workspaceName }}',
                'html_template' => '
<h2>Hello!</h2>
<p>You have been invited to join the <strong>{{ workspaceName }}</strong> workspace by {{ inviterName }}.</p>
<p>This is a great opportunity to collaborate securely.</p>
<br>
<a href="{{ acceptUrl }}" style="display:inline-block;padding:10px 20px;background-color:#000;color:#fff;text-decoration:none;border-radius:5px;">Accept Invitation</a>
',
                'text_template' => "Hello!

You have been invited to join the {{ workspaceName }} workspace by {{ inviterName }}.

Accept your invitation here:
{{ acceptUrl }}",
            ]
        );
    }
}
