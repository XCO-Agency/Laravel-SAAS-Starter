<?php

use App\Models\ChangelogEntry;

it('renders the public changelog page', function () {
    ChangelogEntry::factory()->count(3)->create([
        'is_published' => true,
        'published_at' => now(),
    ]);

    $this->get(route('changelog'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('changelog')
            ->has('entries', 3)
        );
});

it('only shows published entries', function () {
    ChangelogEntry::factory()->create([
        'is_published' => true,
        'published_at' => now(),
    ]);
    ChangelogEntry::factory()->create([
        'is_published' => false,
        'published_at' => null,
    ]);

    $this->get(route('changelog'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('entries', 1)
        );
});

it('orders entries by published_at descending', function () {
    $older = ChangelogEntry::factory()->create([
        'is_published' => true,
        'published_at' => now()->subDays(5),
        'title' => 'Older Entry',
    ]);
    $newer = ChangelogEntry::factory()->create([
        'is_published' => true,
        'published_at' => now(),
        'title' => 'Newer Entry',
    ]);

    $this->get(route('changelog'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('entries', 2)
            ->where('entries.0.title', 'Newer Entry')
            ->where('entries.1.title', 'Older Entry')
        );
});

it('returns empty entries when none are published', function () {
    $this->get(route('changelog'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('changelog')
            ->has('entries', 0)
        );
});
