<?php

use App\Models\StatusIncident;
use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    StatusIncident::query()->delete();
    $this->admin = User::factory()->create(['is_superadmin' => true]);
    $this->user = User::factory()->create();
});

it('renders admin status index for superadmin', function () {
    actingAs($this->admin)
        ->get(route('admin.status.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/status/index'));
});

it('forbids non-admin from accessing admin status routes', function () {
    actingAs($this->user)->get(route('admin.status.index'))->assertForbidden();
    actingAs($this->user)->post(route('admin.status.store'))->assertForbidden();
});

it('forbids guests from accessing admin status routes', function () {
    $this->get(route('admin.status.index'))->assertRedirect(route('login'));
});

it('admin can create a status incident', function () {
    actingAs($this->admin)
        ->post(route('admin.status.store'), [
            'title' => 'API Slowdown',
            'message' => 'We are investigating elevated response times.',
            'status' => StatusIncident::STATUS_DEGRADED,
        ])
        ->assertRedirect(route('admin.status.index'));

    expect(StatusIncident::where('title', 'API Slowdown')->exists())->toBeTrue();
});

it('auto-sets resolved_at when creating incident with operational status', function () {
    actingAs($this->admin)->post(route('admin.status.store'), [
        'title' => 'Resolved Issue',
        'message' => 'Everything is back to normal.',
        'status' => StatusIncident::STATUS_OPERATIONAL,
    ]);

    $incident = StatusIncident::where('title', 'Resolved Issue')->first();
    expect($incident->resolved_at)->not->toBeNull();
});

it('admin can update a status incident', function () {
    $incident = StatusIncident::factory()->create([
        'status' => StatusIncident::STATUS_DEGRADED,
        'resolved_at' => null,
    ]);

    actingAs($this->admin)
        ->put(route('admin.status.update', $incident), [
            'title' => 'Updated Title',
            'message' => $incident->message,
            'status' => StatusIncident::STATUS_OUTAGE,
        ])
        ->assertRedirect(route('admin.status.index'));

    expect($incident->fresh()->title)->toBe('Updated Title');
    expect($incident->fresh()->status)->toBe(StatusIncident::STATUS_OUTAGE);
});

it('auto-sets resolved_at when updating incident to operational', function () {
    $incident = StatusIncident::factory()->create([
        'status' => StatusIncident::STATUS_OUTAGE,
        'resolved_at' => null,
    ]);

    actingAs($this->admin)->put(route('admin.status.update', $incident), [
        'title' => $incident->title,
        'message' => $incident->message,
        'status' => StatusIncident::STATUS_OPERATIONAL,
    ]);

    expect($incident->fresh()->resolved_at)->not->toBeNull();
});

it('clears resolved_at when updating incident to non-operational', function () {
    $incident = StatusIncident::factory()->create([
        'status' => StatusIncident::STATUS_OPERATIONAL,
        'resolved_at' => now()->subHour(),
    ]);

    actingAs($this->admin)->put(route('admin.status.update', $incident), [
        'title' => $incident->title,
        'message' => $incident->message,
        'status' => StatusIncident::STATUS_DEGRADED,
    ]);

    expect($incident->fresh()->resolved_at)->toBeNull();
});

it('admin can delete a status incident', function () {
    $incident = StatusIncident::factory()->create();

    actingAs($this->admin)
        ->delete(route('admin.status.destroy', $incident))
        ->assertRedirect(route('admin.status.index'));

    expect(StatusIncident::find($incident->id))->toBeNull();
});

it('validates required fields when creating', function () {
    actingAs($this->admin)
        ->post(route('admin.status.store'), [])
        ->assertSessionHasErrors(['title', 'message', 'status']);
});
