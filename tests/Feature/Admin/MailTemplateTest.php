<?php

use App\Models\User;
use Spatie\MailTemplates\Models\MailTemplate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('regular users cannot access mail templates admin panel', function () {
    $user = User::factory()->create(['is_superadmin' => false]);

    $this->actingAs($user)
        ->get(route('admin.mail-templates.index'))
        ->assertForbidden();
});

test('superadmins can list mail templates', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);

    MailTemplate::create([
        'mailable' => \App\Mail\WorkspaceInvitation::class,
        'subject' => 'Initial Subject',
        'html_template' => '<p>Hello world</p>',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.mail-templates.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/mail-templates/index')
            ->has('templates.data', 1)
        );
});

test('superadmins can view the edit form for a mail template', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);

    $template = MailTemplate::create([
        'mailable' => \App\Mail\WorkspaceInvitation::class,
        'subject' => 'Initial Subject',
        'html_template' => '<p>Hello world</p>',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.mail-templates.edit', $template))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/mail-templates/edit')
            ->where('mailTemplate.subject', 'Initial Subject')
            ->has('variables')
        );
});

test('superadmins can update a mail template', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);

    $template = MailTemplate::create([
        'mailable' => \App\Mail\WorkspaceInvitation::class,
        'subject' => 'Old Subject',
        'html_template' => '<p>Old Content</p>',
    ]);

    $this->actingAs($admin)
        ->put(route('admin.mail-templates.update', $template), [
            'subject' => 'New Awesome Subject',
            'html_template' => '<h1>New Content</h1>',
            'text_template' => 'New Text Content',
        ])
        ->assertRedirect(route('admin.mail-templates.index'));

    $this->assertDatabaseHas('mail_templates', [
        'id' => $template->id,
        'subject' => 'New Awesome Subject',
        'html_template' => '<h1>New Content</h1>',
    ]);
});
