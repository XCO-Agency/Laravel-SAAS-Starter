<?php

use App\Jobs\DispatchBroadcastMessage;
use App\Models\BroadcastMessage;
use App\Models\User;
use App\Models\Workspace;
use App\Notifications\PlatformBroadcast;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;

test('superadmins can view the broadcasts index', function () {
    $superadmin = User::factory()->superadmin()->create();

    BroadcastMessage::create([
        'sender_id' => $superadmin->id,
        'subject' => 'Test Subject',
        'body' => 'Test Body',
        'target_segment' => 'all_users',
        'send_via_in_app' => true,
        'send_via_email' => false,
        'sent_at' => now(),
    ]);

    $this->actingAs($superadmin)
        ->get(route('admin.broadcasts.index'))
        ->assertSuccessful()
        ->assertSee('Test Subject');
});

test('non-superadmins cannot access broadcasts', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('admin.broadcasts.index'))
        ->assertForbidden();

    $this->actingAs($user)
        ->post(route('admin.broadcasts.store'))
        ->assertForbidden();
});

test('submitting a broadcast dispatches the job and redirects successfully', function () {
    Queue::fake();

    $superadmin = User::factory()->superadmin()->create();

    $payload = [
        'subject' => 'Platform Update',
        'body' => 'We are adding new features.',
        'send_via_in_app' => true,
        'send_via_email' => true,
        'target_segment' => 'workspace_owners',
    ];

    $this->actingAs($superadmin)
        ->post(route('admin.broadcasts.store'), $payload)
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('broadcast_messages', [
        'subject' => 'Platform Update',
        'target_segment' => 'workspace_owners',
    ]);

    Queue::assertPushed(DispatchBroadcastMessage::class);
});

test('broadcast delivery job correctly chunks and filters target segments', function () {
    Notification::fake();

    $superadmin = User::factory()->superadmin()->create();

    // Create users matching different criteria
    $regularUser = User::factory()->create();

    $workspaceOwner = User::factory()->create();
    Workspace::factory()->create(['owner_id' => $workspaceOwner->id]);

    $broadcast = BroadcastMessage::create([
        'sender_id' => $superadmin->id,
        'subject' => 'To Owners Only',
        'body' => 'Body',
        'target_segment' => 'workspace_owners',
        'send_via_email' => true,
        'send_via_in_app' => false,
        'sent_at' => now(),
    ]);

    // Manually run the job
    (new DispatchBroadcastMessage($broadcast))->handle();

    // The owner should receive the notification
    Notification::assertSentTo(
        [$workspaceOwner],
        PlatformBroadcast::class
    );

    // The regular user should not receive it
    Notification::assertNotSentTo(
        [$regularUser, $superadmin],
        PlatformBroadcast::class
    );
});
