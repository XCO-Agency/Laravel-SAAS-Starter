<?php

use App\Enums\TicketPriority;
use App\Models\Ticket;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
    $this->user->workspaces()->attach($this->workspace, ['role' => 'admin']);
    $this->user->update(['current_workspace_id' => $this->workspace->id]);

    $this->superAdmin = User::factory()->create(['is_superadmin' => true]);

    $this->withoutVite();
});

describe('User Ticket Portal', function () {
    it('can view tickets index page', function () {
        Ticket::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'workspace_id' => $this->workspace->id,
        ]);

        $response = $this->actingAs($this->user)->get('/settings/tickets');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page->component('settings/tickets/index'));
    });

    it('lists tickets ordered by priority, most urgent first', function () {
        foreach (['normal', 'urgent', 'low', 'high'] as $priority) {
            Ticket::factory()->create([
                'user_id' => $this->user->id,
                'workspace_id' => $this->workspace->id,
                'priority' => $priority,
            ]);
        }

        $response = $this->actingAs($this->user)->get('/settings/tickets');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('settings/tickets/index')
            ->where('tickets.data.0.priority', 'urgent')
            ->where('tickets.data.1.priority', 'high')
            ->where('tickets.data.2.priority', 'normal')
            ->where('tickets.data.3.priority', 'low')
        );
    });

    it('rejects an invalid priority when creating a ticket', function () {
        $response = $this->actingAs($this->user)
            ->from('/settings/tickets')
            ->post('/settings/tickets', [
                'subject' => 'Broken thing',
                'content' => 'Something is off.',
                'priority' => 'critical',
            ]);

        $response->assertSessionHasErrors('priority');
        $this->assertDatabaseCount('tickets', 0);
    });

    it('can create a new ticket', function () {
        $response = $this->actingAs($this->user)->post('/settings/tickets', [
            'subject' => 'Need help with billing',
            'content' => 'I was double charged this month.',
            'priority' => 'high',
        ]);
        $ticket = Ticket::first();

        $response->assertRedirect("/settings/tickets/{$ticket->id}");
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('tickets', [
            'user_id' => $this->user->id,
            'workspace_id' => $this->workspace->id,
            'subject' => 'Need help with billing',
            'priority' => 'high',
            'status' => 'open',
        ]);

        $ticket = Ticket::first();

        $this->assertDatabaseHas('ticket_replies', [
            'ticket_id' => $ticket->id,
            'user_id' => $this->user->id,
            'content' => 'I was double charged this month.',
            'is_from_admin' => false,
        ]);
    });

    it('can view a specific ticket', function () {
        $ticket = Ticket::factory()->create([
            'user_id' => $this->user->id,
            'workspace_id' => $this->workspace->id,
        ]);

        $response = $this->actingAs($this->user)->get("/settings/tickets/{$ticket->id}");

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page->component('settings/tickets/show'));
    });

    it('cannot view someone elses ticket', function () {
        $otherUser = User::factory()->create();
        $ticket = Ticket::factory()->create([
            'user_id' => $otherUser->id,
        ]);

        $response = $this->actingAs($this->user)->get("/settings/tickets/{$ticket->id}");

        $response->assertForbidden();
    });

    it('can reply to an existing ticket', function () {
        $ticket = Ticket::factory()->create([
            'user_id' => $this->user->id,
            'workspace_id' => $this->workspace->id,
            'status' => 'resolved',
        ]);

        $response = $this->actingAs($this->user)->post("/settings/tickets/{$ticket->id}/replies", [
            'content' => 'Wait, actually the issue is back.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        // Should reopen the ticket
        $this->assertEquals('open', $ticket->fresh()->status);

        $this->assertDatabaseHas('ticket_replies', [
            'ticket_id' => $ticket->id,
            'user_id' => $this->user->id,
            'content' => 'Wait, actually the issue is back.',
        ]);
    });
});

describe('Admin Ticket Portal', function () {
    it('can view admin tickets index page', function () {
        Ticket::factory()->count(5)->create();

        $response = $this->actingAs($this->superAdmin)->get('/admin/tickets');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page->component('admin/tickets/index'));
    });

    it('lists tickets ordered by priority with the status filter applied', function () {
        foreach (['normal', 'urgent', 'low', 'high'] as $priority) {
            Ticket::factory()->create([
                'status' => 'open',
                'priority' => $priority,
            ]);
        }

        // A closed ticket that the status filter must exclude.
        Ticket::factory()->create(['status' => 'closed', 'priority' => 'urgent']);

        $response = $this->actingAs($this->superAdmin)->get('/admin/tickets?status=open');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('admin/tickets/index')
            ->has('tickets.data', 4)
            ->where('tickets.data.0.priority', 'urgent')
            ->where('tickets.data.1.priority', 'high')
            ->where('tickets.data.2.priority', 'normal')
            ->where('tickets.data.3.priority', 'low')
        );
    });

    it('non-admin cannot view admin tickets index page', function () {
        $response = $this->actingAs($this->user)->get('/admin/tickets');

        $response->assertForbidden();
    });

    it('can view a specific ticket in admin portal', function () {
        $ticket = Ticket::factory()->create();

        $response = $this->actingAs($this->superAdmin)->get("/admin/tickets/{$ticket->id}");

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page->component('admin/tickets/show'));
    });

    it('can update ticket status and priority as admin', function () {
        $ticket = Ticket::factory()->create([
            'status' => 'open',
            'priority' => 'low',
        ]);

        $response = $this->actingAs($this->superAdmin)->patch("/admin/tickets/{$ticket->id}", [
            'status' => 'in_progress',
        ]);

        $response->assertRedirect();
        $this->assertEquals('in_progress', $ticket->fresh()->status);

        $response = $this->actingAs($this->superAdmin)->patch("/admin/tickets/{$ticket->id}", [
            'priority' => 'high',
        ]);

        $response->assertRedirect();
        $this->assertEquals(TicketPriority::High, $ticket->fresh()->priority);
    });

    it('can reply to a ticket as an admin', function () {
        $ticket = Ticket::factory()->create(['status' => 'open']);

        $response = $this->actingAs($this->superAdmin)->post("/admin/tickets/{$ticket->id}/replies", [
            'content' => 'We are looking into this.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        // Should auto-change to in_progress from open
        $this->assertEquals('in_progress', $ticket->fresh()->status);

        $this->assertDatabaseHas('ticket_replies', [
            'ticket_id' => $ticket->id,
            'user_id' => $this->superAdmin->id,
            'content' => 'We are looking into this.',
            'is_from_admin' => true,
        ]);
    });
});
