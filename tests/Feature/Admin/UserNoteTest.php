<?php

use App\Models\User;
use App\Models\UserNote;

beforeEach(function () {
    $this->admin = User::factory()->create(['is_superadmin' => true]);
    $this->targetUser = User::factory()->create();
});

it('requires authentication to access user notes', function () {
    $this->getJson("/admin/users/{$this->targetUser->id}/notes")
        ->assertUnauthorized();
});

it('forbids non-superadmin from viewing notes', function () {
    $user = User::factory()->create(['is_superadmin' => false]);

    $this->actingAs($user)
        ->getJson("/admin/users/{$this->targetUser->id}/notes")
        ->assertForbidden();
});

it('superadmin can list notes for a user', function () {
    UserNote::create([
        'user_id' => $this->targetUser->id,
        'admin_id' => $this->admin->id,
        'note' => 'This user is suspicious.',
    ]);

    $this->actingAs($this->admin)
        ->getJson("/admin/users/{$this->targetUser->id}/notes")
        ->assertOk()
        ->assertJsonCount(1, 'notes')
        ->assertJsonPath('notes.0.note', 'This user is suspicious.')
        ->assertJsonPath('notes.0.admin.name', $this->admin->name);
});

it('returns empty notes array when user has no notes', function () {
    $this->actingAs($this->admin)
        ->getJson("/admin/users/{$this->targetUser->id}/notes")
        ->assertOk()
        ->assertJsonCount(0, 'notes');
});

it('superadmin can add a note to a user', function () {
    $this->actingAs($this->admin)
        ->postJson("/admin/users/{$this->targetUser->id}/notes", [
            'note' => 'Contact support regarding billing issue.',
        ])
        ->assertCreated()
        ->assertJsonPath('note.note', 'Contact support regarding billing issue.')
        ->assertJsonPath('note.admin.name', $this->admin->name);

    expect($this->targetUser->notes()->count())->toBe(1);
});

it('validates that note is required', function () {
    $this->actingAs($this->admin)
        ->postJson("/admin/users/{$this->targetUser->id}/notes", ['note' => ''])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['note']);
});

it('validates that note does not exceed 2000 characters', function () {
    $this->actingAs($this->admin)
        ->postJson("/admin/users/{$this->targetUser->id}/notes", ['note' => str_repeat('a', 2001)])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['note']);
});

it('superadmin can delete a note', function () {
    $note = UserNote::create([
        'user_id' => $this->targetUser->id,
        'admin_id' => $this->admin->id,
        'note' => 'To be deleted.',
    ]);

    $this->actingAs($this->admin)
        ->deleteJson("/admin/users/{$this->targetUser->id}/notes/{$note->id}")
        ->assertOk()
        ->assertJsonPath('success', true);

    expect(UserNote::find($note->id))->toBeNull();
});

it('returns 404 when deleting a note that does not belong to the user', function () {
    $otherUser = User::factory()->create();
    $note = UserNote::create([
        'user_id' => $otherUser->id,
        'admin_id' => $this->admin->id,
        'note' => 'Belongs to other user.',
    ]);

    $this->actingAs($this->admin)
        ->deleteJson("/admin/users/{$this->targetUser->id}/notes/{$note->id}")
        ->assertNotFound();
});
