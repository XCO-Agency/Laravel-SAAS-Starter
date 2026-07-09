<?php

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
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

    it('requires authentication to view the tickets index page', function () {
        $response = $this->get('/settings/tickets');

        $response->assertRedirect('/login');
    });

    it('filters the tickets index to only the users own matching status', function () {
        Ticket::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'workspace_id' => $this->workspace->id,
            'status' => 'open',
        ]);
        Ticket::factory()->create([
            'user_id' => $this->user->id,
            'workspace_id' => $this->workspace->id,
            'status' => 'closed',
        ]);

        $response = $this->actingAs($this->user)->get('/settings/tickets?status=open');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('settings/tickets/index')
            ->has('tickets.data', 2)
            ->where('tickets.data.0.status', 'open')
            ->where('tickets.data.1.status', 'open')
            ->where('filters.status', 'open')
        );
    });

    it('falls back to all of the users tickets for an unknown status filter', function () {
        Ticket::factory()->create([
            'user_id' => $this->user->id,
            'workspace_id' => $this->workspace->id,
            'status' => 'open',
        ]);
        Ticket::factory()->create([
            'user_id' => $this->user->id,
            'workspace_id' => $this->workspace->id,
            'status' => 'closed',
        ]);

        $response = $this->actingAs($this->user)->get('/settings/tickets?status=bogus');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('settings/tickets/index')
            ->has('tickets.data', 2)
            ->where('filters.status', null)
        );
    });

    it('never includes another users tickets for any status filter', function () {
        $otherUser = User::factory()->create();
        Ticket::factory()->count(3)->create([
            'user_id' => $otherUser->id,
            'status' => 'open',
        ]);
        Ticket::factory()->create([
            'user_id' => $this->user->id,
            'workspace_id' => $this->workspace->id,
            'status' => 'open',
        ]);

        foreach (['open', 'bogus', ''] as $status) {
            $response = $this->actingAs($this->user)->get('/settings/tickets?status='.$status);

            $response->assertSuccessful();
            $response->assertInertia(fn ($page) => $page
                ->component('settings/tickets/index')
                ->has('tickets.data', 1)
                ->where('tickets.data.0.user_id', $this->user->id)
            );
        }
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
        $this->assertEquals(TicketStatus::Open, $ticket->fresh()->status);

        $this->assertDatabaseHas('ticket_replies', [
            'ticket_id' => $ticket->id,
            'user_id' => $this->user->id,
            'content' => 'Wait, actually the issue is back.',
        ]);
    });

    it('requires authentication to close or reopen a ticket', function () {
        $ticket = Ticket::factory()->create([
            'user_id' => $this->user->id,
            'workspace_id' => $this->workspace->id,
            'status' => 'open',
        ]);

        $this->post("/settings/tickets/{$ticket->id}/close")->assertRedirect('/login');
        $this->post("/settings/tickets/{$ticket->id}/reopen")->assertRedirect('/login');

        expect($ticket->fresh()->status)->toBe(TicketStatus::Open);
    });

    it('owner can close an open, in-progress, or resolved ticket', function (string $status) {
        $ticket = Ticket::factory()->create([
            'user_id' => $this->user->id,
            'workspace_id' => $this->workspace->id,
            'status' => $status,
        ]);

        $response = $this->actingAs($this->user)->post("/settings/tickets/{$ticket->id}/close");

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
        expect($ticket->fresh()->status)->toBe(TicketStatus::Closed);
    })->with(['open', 'in_progress', 'resolved']);

    it('owner can reopen a closed or resolved ticket', function (string $status) {
        $ticket = Ticket::factory()->create([
            'user_id' => $this->user->id,
            'workspace_id' => $this->workspace->id,
            'status' => $status,
        ]);

        $response = $this->actingAs($this->user)->post("/settings/tickets/{$ticket->id}/reopen");

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
        expect($ticket->fresh()->status)->toBe(TicketStatus::Open);
    })->with(['closed', 'resolved']);

    it('cannot close or reopen someone elses ticket', function () {
        $otherUser = User::factory()->create();
        $ticket = Ticket::factory()->create([
            'user_id' => $otherUser->id,
            'status' => 'open',
        ]);

        $this->actingAs($this->user)->post("/settings/tickets/{$ticket->id}/close")->assertForbidden();
        $this->actingAs($this->user)->post("/settings/tickets/{$ticket->id}/reopen")->assertForbidden();

        expect($ticket->fresh()->status)->toBe(TicketStatus::Open);
    });

    it('handles no-op close and reopen transitions safely', function () {
        $closed = Ticket::factory()->create([
            'user_id' => $this->user->id,
            'workspace_id' => $this->workspace->id,
            'status' => 'closed',
        ]);

        $response = $this->actingAs($this->user)->post("/settings/tickets/{$closed->id}/close");
        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
        expect($closed->fresh()->status)->toBe(TicketStatus::Closed);

        $open = Ticket::factory()->create([
            'user_id' => $this->user->id,
            'workspace_id' => $this->workspace->id,
            'status' => 'open',
        ]);

        $response = $this->actingAs($this->user)->post("/settings/tickets/{$open->id}/reopen");
        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
        expect($open->fresh()->status)->toBe(TicketStatus::Open);
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

    it('ignores an unknown status filter instead of returning an empty result set', function () {
        Ticket::factory()->create(['status' => 'open']);
        Ticket::factory()->create(['status' => 'closed']);

        $response = $this->actingAs($this->superAdmin)->get('/admin/tickets?status=bogus');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('admin/tickets/index')
            ->has('tickets.data', 2)
        );
    });

    it('ignores an array status filter instead of throwing a warning', function () {
        Ticket::factory()->create(['status' => 'open']);
        Ticket::factory()->create(['status' => 'closed']);

        $response = $this->actingAs($this->superAdmin)->get('/admin/tickets?status[]=open');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('admin/tickets/index')
            ->has('tickets.data', 2)
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
        $this->assertEquals(TicketStatus::InProgress, $ticket->fresh()->status);

        $response = $this->actingAs($this->superAdmin)->patch("/admin/tickets/{$ticket->id}", [
            'priority' => 'high',
        ]);

        $response->assertRedirect();
        $this->assertEquals(TicketPriority::High, $ticket->fresh()->priority);
    });

    it('casts the status attribute to a TicketStatus enum', function () {
        $ticket = Ticket::factory()->create(['status' => 'resolved']);

        expect($ticket->fresh()->status)->toBe(TicketStatus::Resolved);
    });

    it('rejects an invalid status when updating and leaves it unchanged', function () {
        $ticket = Ticket::factory()->create(['status' => 'open']);

        $response = $this->actingAs($this->superAdmin)->patch("/admin/tickets/{$ticket->id}", [
            'status' => 'bogus',
        ]);

        $response->assertSessionHasErrors('status');
        $this->assertEquals(TicketStatus::Open, $ticket->fresh()->status);
    });

    it('can reply to a ticket as an admin', function () {
        $ticket = Ticket::factory()->create(['status' => 'open']);

        $response = $this->actingAs($this->superAdmin)->post("/admin/tickets/{$ticket->id}/replies", [
            'content' => 'We are looking into this.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        // Should auto-change to in_progress from open
        $this->assertEquals(TicketStatus::InProgress, $ticket->fresh()->status);

        $this->assertDatabaseHas('ticket_replies', [
            'ticket_id' => $ticket->id,
            'user_id' => $this->superAdmin->id,
            'content' => 'We are looking into this.',
            'is_from_admin' => true,
        ]);
    });
});
