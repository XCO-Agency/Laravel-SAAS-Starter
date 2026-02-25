<?php

use App\Models\ChangelogEntry;
use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->superadmin = User::factory()->create(['is_superadmin' => true]);
    $this->user = User::factory()->create();
});

// --- Admin CRUD ---

it('allows superadmin to view the admin changelog page', function () {
    ChangelogEntry::factory()->count(3)->create();

    actingAs($this->superadmin)
        ->get('/admin/changelog')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/changelog')
            ->has('entries', 3)
        );
});

it('blocks regular users from the admin changelog page', function () {
    actingAs($this->user)
        ->get('/admin/changelog')
        ->assertForbidden();
});

it('allows superadmin to create a changelog entry', function () {
    actingAs($this->superadmin)
        ->post('/admin/changelog', [
            'version' => '2.0.0',
            'title' => 'Major Release',
            'body' => 'Lots of improvements.',
            'type' => 'feature',
            'is_published' => true,
        ])
        ->assertRedirect();

    expect(ChangelogEntry::count())->toBe(1);
    expect(ChangelogEntry::first())
        ->version->toBe('2.0.0')
        ->title->toBe('Major Release')
        ->is_published->toBeTrue()
        ->published_at->not->toBeNull();
});

it('allows superadmin to create a draft entry', function () {
    actingAs($this->superadmin)
        ->post('/admin/changelog', [
            'version' => '2.1.0',
            'title' => 'Draft Feature',
            'body' => 'Work in progress.',
            'type' => 'improvement',
            'is_published' => false,
        ])
        ->assertRedirect();

    expect(ChangelogEntry::first())
        ->is_published->toBeFalse()
        ->published_at->toBeNull();
});

it('validates required fields when creating', function () {
    actingAs($this->superadmin)
        ->post('/admin/changelog', [
            'version' => '',
            'title' => '',
            'body' => '',
            'type' => 'invalid',
        ])
        ->assertSessionHasErrors(['version', 'title', 'body', 'type']);
});

it('allows superadmin to update a changelog entry', function () {
    $entry = ChangelogEntry::factory()->create(['title' => 'Old Title']);

    actingAs($this->superadmin)
        ->put("/admin/changelog/{$entry->id}", [
            'version' => $entry->version,
            'title' => 'New Title',
            'body' => $entry->body,
            'type' => $entry->type,
            'is_published' => true,
        ])
        ->assertRedirect();

    expect($entry->fresh()->title)->toBe('New Title');
});

it('allows superadmin to delete a changelog entry', function () {
    $entry = ChangelogEntry::factory()->create();

    actingAs($this->superadmin)
        ->delete("/admin/changelog/{$entry->id}")
        ->assertRedirect();

    expect(ChangelogEntry::count())->toBe(0);
});

// --- Public page ---

it('shows only published entries on the public changelog page', function () {
    ChangelogEntry::factory()->count(2)->create(['is_published' => true]);
    ChangelogEntry::factory()->draft()->create();

    $this->get('/changelog')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('changelog')
            ->has('entries', 2)
        );
});

it('displays the public changelog to unauthenticated users', function () {
    $this->get('/changelog')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('changelog'));
});
