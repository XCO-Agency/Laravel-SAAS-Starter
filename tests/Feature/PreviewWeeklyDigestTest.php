<?php

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\Notification;

it('fails when workspace is not found', function () {
    $this->artisan('app:preview-weekly-digest', ['workspace' => '999999'])
        ->assertFailed()
        ->expectsOutputToContain('not found');
});

it('finds workspace by id', function () {
    $owner = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
    $workspace->addUser($owner, 'owner');

    $this->artisan('app:preview-weekly-digest', ['workspace' => $workspace->id])
        ->assertSuccessful()
        ->expectsOutputToContain($workspace->name);
});

it('finds workspace by slug', function () {
    $owner = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $owner->id, 'slug' => 'my-test-workspace']);
    $workspace->addUser($owner, 'owner');

    $this->artisan('app:preview-weekly-digest', ['workspace' => 'my-test-workspace'])
        ->assertSuccessful()
        ->expectsOutputToContain($workspace->name);
});

it('outputs digest content without sending notifications', function () {
    Notification::fake();

    $owner = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
    $workspace->addUser($owner, 'owner');

    $this->artisan('app:preview-weekly-digest', ['workspace' => $workspace->id])
        ->assertSuccessful();

    Notification::assertNothingSent();
});

it('outputs workspace name in preview', function () {
    $owner = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $owner->id, 'name' => 'Unique Preview Workspace']);
    $workspace->addUser($owner, 'owner');

    $this->artisan('app:preview-weekly-digest', ['workspace' => $workspace->id])
        ->assertSuccessful()
        ->expectsOutputToContain('Unique Preview Workspace');
});

it('outputs member count stats', function () {
    $owner = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
    $workspace->addUser($owner, 'owner');
    $member = User::factory()->create();
    $workspace->addUser($member, 'member');

    $this->artisan('app:preview-weekly-digest', ['workspace' => $workspace->id])
        ->assertSuccessful()
        ->expectsOutputToContain('Members');
});
