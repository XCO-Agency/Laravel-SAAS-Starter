<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('allows a user to test uploading a valid avatar', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $file = UploadedFile::fake()->image('avatar.jpg');

    $response = $this->actingAs($user)
        ->patch('/settings/profile', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'avatar' => $file,
            'timezone' => 'UTC',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect('/settings/profile');

    $user->refresh();

    expect($user->avatar_url)->not->toBeNull();
    Storage::disk('public')->assertExists($user->avatar_url);
});

it('rejects invalid avatar file types natively', function () {
    $user = User::factory()->create();

    $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

    $response = $this->actingAs($user)
        ->patch('/settings/profile', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'avatar' => $file,
            'timezone' => 'UTC',
        ]);

    $response->assertSessionHasErrors('avatar');
    expect($user->fresh()->avatar_url)->toBeNull();
});

it('allows a user to explicitly remove an existing avatar', function () {
    Storage::fake('public');

    $user = User::factory()->create([
        'avatar_url' => 'avatars/test-avatar.jpg',
    ]);

    // Simulate generic existance natively to prevent false deletion passes
    Storage::disk('public')->put('avatars/test-avatar.jpg', 'fake-image-content');

    $response = $this->actingAs($user)
        ->patch('/settings/profile', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'remove_avatar' => true,
            'timezone' => 'UTC',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect('/settings/profile');

    $user->refresh();

    expect($user->avatar_url)->toBeNull();
    Storage::disk('public')->assertMissing('avatars/test-avatar.jpg');
});
