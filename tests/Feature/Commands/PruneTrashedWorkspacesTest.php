<?php

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\DB;

it('permanently deletes trashed workspaces past the grace period', function () {
    $user = User::factory()->withoutTwoFactor()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user->id, ['role' => 'owner']);

    // Soft delete it and backdate the deletion
    $workspace->delete();
    DB::table('workspaces')->where('id', $workspace->id)->update(['deleted_at' => now()->subDays(31)]);

    $this->artisan('workspaces:prune-trashed')
        ->assertSuccessful();

    expect(Workspace::withTrashed()->find($workspace->id))->toBeNull();
});

it('does not delete recently trashed workspaces', function () {
    $user = User::factory()->withoutTwoFactor()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user->id, ['role' => 'owner']);

    $workspace->delete();

    $this->artisan('workspaces:prune-trashed')
        ->assertSuccessful();

    expect(Workspace::withTrashed()->find($workspace->id))->not->toBeNull();
});

it('supports custom days option', function () {
    $user = User::factory()->withoutTwoFactor()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user->id, ['role' => 'owner']);

    $workspace->delete();
    DB::table('workspaces')->where('id', $workspace->id)->update(['deleted_at' => now()->subDays(8)]);

    $this->artisan('workspaces:prune-trashed', ['--days' => 7])
        ->assertSuccessful();

    expect(Workspace::withTrashed()->find($workspace->id))->toBeNull();
});

it('detaches users when force deleting workspace', function () {
    $user = User::factory()->withoutTwoFactor()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user->id, ['role' => 'owner']);

    $workspace->delete();
    DB::table('workspaces')->where('id', $workspace->id)->update(['deleted_at' => now()->subDays(31)]);

    $this->artisan('workspaces:prune-trashed')
        ->assertSuccessful();

    expect($user->workspaces()->count())->toBe(0);
});
