<?php

use App\Models\Feedback;
use App\Models\User;
use App\Models\Workspace;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->superadmin = User::factory()->create(['is_superadmin' => true]);
    $this->user = User::factory()->create();
    $this->workspace = Workspace::factory()->create();
    $this->workspace->users()->attach($this->user, ['role' => 'owner']);
    $this->user->update(['current_workspace_id' => $this->workspace->id]);

    // Create sample feedback items
    Feedback::create([
        'user_id' => $this->user->id,
        'workspace_id' => $this->workspace->id,
        'type' => 'bug',
        'message' => 'There is a bug on the dashboard page that breaks layout.',
        'status' => 'new',
    ]);

    Feedback::create([
        'user_id' => $this->user->id,
        'workspace_id' => $this->workspace->id,
        'type' => 'idea',
        'message' => 'It would be great to have dark mode for the admin panel.',
        'status' => 'reviewed',
    ]);
});

it('allows superadmin to view feedback index', function () {
    actingAs($this->superadmin)
        ->get('/admin/feedback')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/feedback')
            ->has('feedback')
            ->has('counts'));
});

it('denies non-superadmin access to feedback index', function () {
    actingAs($this->user)
        ->get('/admin/feedback')
        ->assertForbidden();
});

it('allows superadmin to update feedback status to reviewed', function () {
    $fb = Feedback::where('type', 'bug')->first();

    actingAs($this->superadmin)
        ->putJson("/admin/feedback/{$fb->id}", ['status' => 'reviewed'])
        ->assertRedirect();

    expect($fb->fresh()->status)->toBe('reviewed');
});

it('allows superadmin to archive feedback', function () {
    $fb = Feedback::where('type', 'bug')->first();

    actingAs($this->superadmin)
        ->putJson("/admin/feedback/{$fb->id}", ['status' => 'archived'])
        ->assertRedirect();

    expect($fb->fresh()->status)->toBe('archived');
});

it('rejects invalid status values', function () {
    $fb = Feedback::where('type', 'bug')->first();

    actingAs($this->superadmin)
        ->putJson("/admin/feedback/{$fb->id}", ['status' => 'bogus'])
        ->assertUnprocessable();
});

it('allows superadmin to delete feedback', function () {
    $fb = Feedback::first();

    actingAs($this->superadmin)
        ->delete("/admin/feedback/{$fb->id}")
        ->assertRedirect();

    expect(Feedback::find($fb->id))->toBeNull();
});

it('filters feedback by type', function () {
    actingAs($this->superadmin)
        ->get('/admin/feedback?type=bug')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('feedback.data', 1));
});

it('filters feedback by status', function () {
    actingAs($this->superadmin)
        ->get('/admin/feedback?status=reviewed')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('feedback.data', 1));
});
