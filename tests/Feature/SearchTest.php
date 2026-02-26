<?php

use App\Models\Announcement;
use App\Models\ChangelogEntry;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create(['name' => 'John Doe', 'email' => 'john@example.com']);
    $this->workspace = Workspace::factory()->create(['name' => 'Acme Corp', 'owner_id' => $this->user->id]);
    $this->user->workspaces()->attach($this->workspace->id, ['role' => 'owner']);
    $this->user->switchWorkspace($this->workspace);
});

it('can search for users', function () {
    $jane = User::factory()->create(['name' => 'Jane Smith', 'email' => 'jane@example.com']);
    $this->workspace->users()->attach($jane->id, ['role' => 'member']);

    $response = $this->actingAs($this->user)
        ->getJson(route('search.index', ['query' => 'Jane']));

    $response->assertStatus(200)
        ->assertJsonFragment(['title' => 'Jane Smith']);
});

it('can search for workspaces', function () {
    $globex = Workspace::factory()->create(['name' => 'Globex Corporation', 'owner_id' => $this->user->id]);
    $this->user->workspaces()->attach($globex->id, ['role' => 'owner']);

    $response = $this->actingAs($this->user)
        ->getJson(route('search.index', ['query' => 'Globex']));

    $response->assertStatus(200)
        ->assertJsonFragment(['title' => 'Globex Corporation']);
});

it('can search for announcements', function () {
    Announcement::factory()->create(['title' => 'New Feature Launch', 'is_active' => true]);

    $response = $this->actingAs($this->user)
        ->getJson(route('search.index', ['query' => 'Launch']));

    $response->assertStatus(200)
        ->assertJsonFragment(['title' => 'New Feature Launch']);
});

it('can search for changelog entries', function () {
    ChangelogEntry::factory()->create(['title' => 'Version 2.0 Release', 'version' => '2.0.0']);

    $response = $this->actingAs($this->user)
        ->getJson(route('search.index', ['query' => '2.0']));

    $response->assertStatus(200)
        ->assertJsonFragment(['title' => 'Version 2.0 Release']);
});

it('returns empty results for empty query', function () {
    $response = $this->actingAs($this->user)
        ->getJson(route('search.index', ['query' => '']));

    $response->assertStatus(200)
        ->assertJsonCount(0);
});

it('returns grouped results', function () {
    User::factory()->create(['name' => 'Test User']);

    // Regular user should only see their own workspace
    $response = $this->actingAs($this->user)
        ->getJson(route('search.index', ['query' => 'Acme']));

    $response->assertStatus(200)
        ->assertJsonStructure([
            'Workspace',
        ]);
});

it('restricts regular users to their own workspace members', function () {
    $otherUser = User::factory()->create(['name' => 'Secret User']);

    $response = $this->actingAs($this->user)
        ->getJson(route('search.index', ['query' => 'Secret']));

    $response->assertStatus(200)
        ->assertJsonMissing(['title' => 'Secret User']);
});

it('allows superadmins to search globally', function () {
    $superAdmin = User::factory()->create(['is_superadmin' => true]);
    $secretUser = User::factory()->create(['name' => 'Secret User']);

    $response = $this->actingAs($superAdmin)
        ->getJson(route('search.index', ['query' => 'Secret']));

    $response->assertStatus(200)
        ->assertJsonFragment(['title' => 'Secret User']);
});

it('restricts regular users to their own workspaces', function () {
    $otherWorkspace = Workspace::factory()->create(['name' => 'Other Inc']);

    $response = $this->actingAs($this->user)
        ->getJson(route('search.index', ['query' => 'Other']));

    $response->assertStatus(200)
        ->assertJsonMissing(['title' => 'Other Inc']);
});
