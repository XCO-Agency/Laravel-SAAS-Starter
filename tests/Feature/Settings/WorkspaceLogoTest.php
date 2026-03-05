<?php

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
    $this->owner = User::factory()->create();
    $this->admin = User::factory()->create();
    $this->member = User::factory()->create();

    $this->workspace = Workspace::factory()->create(['owner_id' => $this->owner->id]);
    $this->workspace->users()->attach($this->owner->id, ['role' => 'owner']);
    $this->workspace->users()->attach($this->admin->id, ['role' => 'admin']);
    $this->workspace->users()->attach($this->member->id, ['role' => 'member']);

    // Ensure users have this workspace as their current workspace
    $this->owner->forceFill(['current_workspace_id' => $this->workspace->id])->save();
    $this->admin->forceFill(['current_workspace_id' => $this->workspace->id])->save();
    $this->member->forceFill(['current_workspace_id' => $this->workspace->id])->save();
});

it('allows owners to upload a workspace logo', function () {
    $file = UploadedFile::fake()->image('logo.jpg');

    $response = $this->actingAs($this->owner)
        ->post('/workspaces/settings/logo', [
            'image' => $file,
        ]);

    $response->assertSuccessful();

    $this->workspace->refresh();

    $path = $this->workspace->getRawOriginal('logo');
    expect($path)->not->toBeNull();
    Storage::disk('public')->assertExists($path);
});

it('allows admins to upload a workspace logo', function () {
    $file = UploadedFile::fake()->image('logo.jpg');

    $response = $this->actingAs($this->admin)
        ->post('/workspaces/settings/logo', [
            'image' => $file,
        ]);

    $response->assertSuccessful();

    $this->workspace->refresh();

    expect($this->workspace->getRawOriginal('logo'))->not->toBeNull();
});

it('denies members from uploading a workspace logo', function () {
    $file = UploadedFile::fake()->image('logo.jpg');

    $response = $this->actingAs($this->member)
        ->post('/workspaces/settings/logo', [
            'image' => $file,
        ]);

    $response->assertForbidden();
});

it('allows owners to delete a workspace logo', function () {
    $this->workspace->update(['logo' => 'logos/test.jpg']);
    Storage::disk('public')->put('logos/test.jpg', 'fake content');

    $response = $this->actingAs($this->owner)
        ->delete('/workspaces/settings/logo');

    $response->assertSuccessful();

    $this->workspace->refresh();

    expect($this->workspace->getRawOriginal('logo'))->toBeNull();
    Storage::disk('public')->assertMissing('logos/test.jpg');
});

it('denies members from deleting a workspace logo', function () {
    $this->workspace->update(['logo' => 'logos/test.jpg']);

    $response = $this->actingAs($this->member)
        ->delete('/workspaces/settings/logo');

    $response->assertForbidden();
});

it('restricts logo management to authenticated users', function () {
    $this->post('/workspaces/settings/logo')
        ->assertRedirect('/login');

    $this->delete('/workspaces/settings/logo')
        ->assertRedirect('/login');
});
