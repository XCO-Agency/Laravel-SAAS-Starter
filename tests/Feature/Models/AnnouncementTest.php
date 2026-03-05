<?php

use App\Models\Announcement;
use Illuminate\Support\Carbon;

it('casts is_active to boolean', function () {
    $announcement = new Announcement(['is_active' => '1']);
    expect($announcement->is_active)->toBeTrue();
});

it('casts is_dismissible to boolean', function () {
    $announcement = new Announcement(['is_dismissible' => '0']);
    expect($announcement->is_dismissible)->toBeFalse();
});

it('casts starts_at and ends_at to datetime', function () {
    $announcement = Announcement::factory()->create([
        'starts_at' => '2025-01-01 00:00:00',
        'ends_at' => '2025-12-31 23:59:59',
    ]);
    expect($announcement->starts_at)->toBeInstanceOf(Carbon::class);
    expect($announcement->ends_at)->toBeInstanceOf(Carbon::class);
});

it('scopes currently active announcements by is_active flag', function () {
    Announcement::factory()->create(['is_active' => true]);
    Announcement::factory()->create(['is_active' => false]);

    expect(Announcement::currentlyActive()->count())->toBe(1);
});

it('scopes currently active announcements by date range', function () {
    // Active with valid range
    Announcement::factory()->create([
        'is_active' => true,
        'starts_at' => now()->subDay(),
        'ends_at' => now()->addDay(),
    ]);

    // Active but expired
    Announcement::factory()->create([
        'is_active' => true,
        'starts_at' => now()->subWeek(),
        'ends_at' => now()->subDay(),
    ]);

    // Active but not started yet
    Announcement::factory()->create([
        'is_active' => true,
        'starts_at' => now()->addDay(),
        'ends_at' => now()->addWeek(),
    ]);

    expect(Announcement::currentlyActive()->count())->toBe(1);
});

it('scopes currently active announcements with null date ranges', function () {
    Announcement::factory()->create([
        'is_active' => true,
        'starts_at' => null,
        'ends_at' => null,
    ]);

    expect(Announcement::currentlyActive()->count())->toBe(1);
});

it('returns correct searchable array', function () {
    $announcement = Announcement::factory()->create([
        'title' => 'Test Title',
        'body' => 'Test Body',
    ]);

    $searchable = $announcement->toSearchableArray();

    expect($searchable)->toHaveKeys(['id', 'title', 'body']);
    expect($searchable['title'])->toBe('Test Title');
});
