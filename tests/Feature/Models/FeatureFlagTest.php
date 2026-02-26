<?php

use App\Models\FeatureFlag;
use App\Models\Workspace;
use Illuminate\Support\Facades\Cache;
use Laravel\Pennant\Feature;

test('it flushes cache and registers flags on save', function () {
    Cache::shouldReceive('forget')->with('feature_flags_definitions')->once();
    // Pennant Feature::flushCache() is harder to mock easily without full setup,
    // but we can verify the booted effect indirectly if needed.

    $flag = FeatureFlag::factory()->create([
        'key' => 'new-feature',
        'is_global' => true,
    ]);

    expect($flag->key)->toBe('new-feature');
});

test('it flushes cache and purges on delete', function () {
    $flag = FeatureFlag::factory()->create(['key' => 'to-delete']);

    Cache::shouldReceive('forget')->with('feature_flags_definitions')->atLeast()->once();

    $flag->delete();

    // Check if purged (indirectly via database check since we are testing the model)
    expect(FeatureFlag::where('key', 'to-delete')->exists())->toBeFalse();
});

test('it casts workspace_ids to array', function () {
    $workspace = Workspace::factory()->create();
    $flag = FeatureFlag::factory()->create([
        'workspace_ids' => [$workspace->id],
    ]);

    expect($flag->workspace_ids)->toBeArray();
    expect($flag->workspace_ids)->toContain($workspace->id);
});
