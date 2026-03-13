<?php

use App\Models\ChangelogEntry;
use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->user = User::factory()->create(['changelog_read_at' => null]);
    $workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
    $workspace->addUser($this->user, 'owner');
    $this->user->switchWorkspace($workspace);
});

it('requires authentication', function () {
    $this->getJson('/changelog-widget')->assertUnauthorized();
    $this->postJson('/changelog-widget/mark-read')->assertUnauthorized();
});

it('returns published changelog entries', function () {
    ChangelogEntry::factory()->create([
        'title' => 'New Feature',
        'is_published' => true,
        'published_at' => now(),
    ]);

    $this->actingAs($this->user)
        ->getJson('/changelog-widget')
        ->assertOk()
        ->assertJsonCount(1, 'entries')
        ->assertJsonPath('entries.0.title', 'New Feature');
});

it('does not return unpublished entries', function () {
    ChangelogEntry::factory()->create([
        'title' => 'Draft Entry',
        'is_published' => false,
        'published_at' => null,
    ]);

    $this->actingAs($this->user)
        ->getJson('/changelog-widget')
        ->assertOk()
        ->assertJsonCount(0, 'entries');
});

it('returns at most 5 entries', function () {
    ChangelogEntry::factory()->count(8)->create([
        'is_published' => true,
        'published_at' => now(),
    ]);

    $this->actingAs($this->user)
        ->getJson('/changelog-widget')
        ->assertOk()
        ->assertJsonCount(5, 'entries');
});

it('shows has_unread true when user has never read changelog', function () {
    ChangelogEntry::factory()->create([
        'is_published' => true,
        'published_at' => now(),
    ]);

    $this->actingAs($this->user)
        ->getJson('/changelog-widget')
        ->assertOk()
        ->assertJsonPath('has_unread', true);
});

it('shows has_unread false when user has read all entries', function () {
    ChangelogEntry::factory()->create([
        'is_published' => true,
        'published_at' => now()->subDay(),
    ]);

    $this->user->update(['changelog_read_at' => now()]);

    $this->actingAs($this->user)
        ->getJson('/changelog-widget')
        ->assertOk()
        ->assertJsonPath('has_unread', false);
});

it('shows has_unread true when new entries since last read', function () {
    ChangelogEntry::factory()->create([
        'is_published' => true,
        'published_at' => now(),
    ]);

    $this->user->update(['changelog_read_at' => now()->subDay()]);

    $this->actingAs($this->user)
        ->getJson('/changelog-widget')
        ->assertOk()
        ->assertJsonPath('has_unread', true);
});

it('mark-read updates changelog_read_at', function () {
    $this->actingAs($this->user)
        ->postJson('/changelog-widget/mark-read')
        ->assertOk()
        ->assertJsonPath('success', true);

    expect($this->user->fresh()->changelog_read_at)->not->toBeNull();
});

it('shows has_unread false when no entries exist', function () {
    $this->actingAs($this->user)
        ->getJson('/changelog-widget')
        ->assertOk()
        ->assertJsonPath('has_unread', false);
});
