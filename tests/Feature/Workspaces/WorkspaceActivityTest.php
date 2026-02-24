<?php

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Activitylog\Models\Activity;

uses(RefreshDatabase::class);

it('logs workspace creation automatically', function () {
    $user = User::factory()->create();

    $this->actingAs($user);

    $workspace = Workspace::create([
        'name' => 'Acme Corp',
        'slug' => 'acme-corp',
        'owner_id' => $user->id,
        'personal_workspace' => false,
    ]);

    $activity = Activity::where('subject_type', Workspace::class)
        ->where('subject_id', $workspace->id)
        ->first();

    $this->assertNotNull($activity);
    $this->assertEquals('workspace', $activity->log_name);
    // Spatie defaults to "created" for the create event
    $this->assertEquals('created', $activity->event);
});

it('logs workspace updates explicitly', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

    $this->actingAs($user);

    // Update the workspace name
    $workspace->update(['name' => 'Updated Acme Corp']);

    $activity = Activity::where('subject_type', Workspace::class)
        ->where('subject_id', $workspace->id)
        ->where('event', 'updated')
        ->first();

    $this->assertNotNull($activity);
    $this->assertEquals('Updated Acme Corp', $activity->properties['attributes']['name']);
});

it('allows workspace admins to view the activity log feed', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $user->workspaces()->attach($workspace, ['role' => 'admin']);
    $user->switchWorkspace($workspace);

    $this->actingAs($user);

    $response = $this->get("/workspaces/{$workspace->id}/activity");

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page->component('workspaces/activity/index'));
});

it('prevents regular members from viewing the activity log feed', function () {
    $owner = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
    $owner->workspaces()->attach($workspace, ['role' => 'owner']);

    $member = User::factory()->create();
    $member->workspaces()->attach($workspace, ['role' => 'member']);
    $member->switchWorkspace($workspace);

    $this->actingAs($member);

    $response = $this->get("/workspaces/{$workspace->id}/activity");

    $response->assertForbidden();
});
