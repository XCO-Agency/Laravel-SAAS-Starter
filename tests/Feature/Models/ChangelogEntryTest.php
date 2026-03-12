<?php

use App\Models\ChangelogEntry;
use Illuminate\Support\Carbon;

it('casts is_published to boolean', function () {
    $entry = new ChangelogEntry(['is_published' => '1']);
    expect($entry->is_published)->toBeTrue();
});

it('casts published_at to datetime', function () {
    $entry = ChangelogEntry::factory()->create([
        'published_at' => '2025-06-15 12:00:00',
    ]);
    expect($entry->published_at)->toBeInstanceOf(Carbon::class);
});

it('scopes published entries', function () {
    ChangelogEntry::factory()->create(['is_published' => true]);
    ChangelogEntry::factory()->create(['is_published' => false]);

    expect(ChangelogEntry::published()->count())->toBe(1);
});

it('returns correct searchable array', function () {
    $entry = ChangelogEntry::factory()->create([
        'title' => 'v2.0',
        'body' => 'New features',
        'version' => '2.0.0',
    ]);

    $searchable = $entry->toSearchableArray();

    expect($searchable)->toHaveKeys(['id', 'title', 'body', 'version']);
    expect($searchable['version'])->toBe('2.0.0');
});
