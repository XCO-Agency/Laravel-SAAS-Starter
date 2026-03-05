<?php

use App\Models\ChangelogEntry;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->withoutTwoFactor()->create(['is_superadmin' => true]);
});

it('renders the admin changelog page', function () {
    $this->actingAs($this->admin)
        ->get(route('admin.changelog.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/changelog')
            ->has('entries')
        );
});

it('can create a changelog entry', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.changelog.store'), [
            'version' => '1.0.0',
            'title' => 'Initial Release',
            'body' => 'First version of the app.',
            'type' => 'feature',
            'is_published' => false,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('changelog_entries', [
        'version' => '1.0.0',
        'title' => 'Initial Release',
        'is_published' => false,
    ]);
});

it('sets published_at when creating a published entry', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.changelog.store'), [
            'version' => '1.1.0',
            'title' => 'Published Release',
            'body' => 'Published at creation.',
            'type' => 'improvement',
            'is_published' => true,
        ])
        ->assertRedirect();

    $entry = ChangelogEntry::where('version', '1.1.0')->first();
    expect($entry->published_at)->not->toBeNull();
});

it('can update a changelog entry', function () {
    $entry = ChangelogEntry::factory()->create([
        'title' => 'Old Title',
        'version' => '1.0.0',
        'body' => 'Old body',
        'type' => 'fix',
    ]);

    $this->actingAs($this->admin)
        ->put(route('admin.changelog.update', $entry), [
            'version' => '1.0.1',
            'title' => 'Updated Title',
            'body' => 'Updated body.',
            'type' => 'fix',
            'is_published' => false,
        ])
        ->assertRedirect();

    expect($entry->fresh()->title)->toBe('Updated Title');
});

it('sets published_at when toggling to published', function () {
    $entry = ChangelogEntry::factory()->create([
        'is_published' => false,
        'published_at' => null,
    ]);

    $this->actingAs($this->admin)
        ->put(route('admin.changelog.update', $entry), [
            'version' => $entry->version,
            'title' => $entry->title,
            'body' => $entry->body,
            'type' => $entry->type,
            'is_published' => true,
        ])
        ->assertRedirect();

    expect($entry->fresh()->published_at)->not->toBeNull();
});

it('clears published_at when unpublishing', function () {
    $entry = ChangelogEntry::factory()->create([
        'is_published' => true,
        'published_at' => now(),
    ]);

    $this->actingAs($this->admin)
        ->put(route('admin.changelog.update', $entry), [
            'version' => $entry->version,
            'title' => $entry->title,
            'body' => $entry->body,
            'type' => $entry->type,
            'is_published' => false,
        ])
        ->assertRedirect();

    expect($entry->fresh()->published_at)->toBeNull();
});

it('can delete a changelog entry', function () {
    $entry = ChangelogEntry::factory()->create();

    $this->actingAs($this->admin)
        ->delete(route('admin.changelog.destroy', $entry))
        ->assertRedirect();

    $this->assertDatabaseMissing('changelog_entries', ['id' => $entry->id]);
});

it('validates required fields on store', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.changelog.store'), [])
        ->assertSessionHasErrors(['version', 'title', 'body', 'type']);
});

it('validates type enum on store', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.changelog.store'), [
            'version' => '1.0.0',
            'title' => 'Test',
            'body' => 'Body',
            'type' => 'invalid',
        ])
        ->assertSessionHasErrors('type');
});

it('denies access to non-superadmin users', function () {
    $user = User::factory()->withoutTwoFactor()->create(['is_superadmin' => false]);

    $this->actingAs($user)
        ->get(route('admin.changelog.index'))
        ->assertForbidden();
});
