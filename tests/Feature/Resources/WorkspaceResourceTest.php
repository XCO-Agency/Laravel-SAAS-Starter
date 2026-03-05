<?php

use App\Http\Resources\WorkspaceResource;
use App\Models\Workspace;
use Illuminate\Http\Request;

it('transforms workspace into correct array structure', function () {
    $workspace = Workspace::factory()->create([
        'name' => 'Test Workspace',
        'slug' => 'test-workspace',
    ]);

    $resource = (new WorkspaceResource($workspace))->toArray(new Request);

    expect($resource)
        ->toHaveKeys(['id', 'name', 'slug', 'logo', 'plan', 'created_at'])
        ->and($resource['id'])->toBe($workspace->id)
        ->and($resource['name'])->toBe('Test Workspace')
        ->and($resource['slug'])->toBe('test-workspace')
        ->and($resource['created_at'])->toBe($workspace->created_at->toIso8601String());
});
