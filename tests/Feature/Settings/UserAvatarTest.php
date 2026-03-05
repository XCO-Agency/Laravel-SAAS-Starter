<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
});

it('allows a user to upload an avatar', function () {
    $user = User::factory()->create();

    $file = UploadedFile::fake()->image('avatar.jpg');

    $response = $this->actingAs($user)
        ->post('/settings/profile/avatar', [
            'image' => $file,
        ]);

    $response->assertSuccessful();

    $user->refresh();

    $path = $user->getRawOriginal('avatar_url');
    expect($path)->not->toBeNull();
    Storage::disk('public')->assertExists($path);
});

it('avoids uploading invalid files as avatars', function () {
    $user = User::factory()->create();

    $file = UploadedFile::fake()->create('document.pdf', 100);

    $response = $this->actingAs($user)
        ->post('/settings/profile/avatar', [
            'image' => $file,
        ]);

    $response->assertSessionHasErrors('image');
});

it('allows a user to delete their avatar', function () {
    $user = User::factory()->create([
        'avatar_url' => 'avatars/test.jpg',
    ]);
    Storage::disk('public')->put('avatars/test.jpg', 'fake content');

    $response = $this->actingAs($user)
        ->delete('/settings/profile/avatar');

    $response->assertSuccessful();

    $user->refresh();

    expect($user->getRawOriginal('avatar_url'))->toBeNull();
    Storage::disk('public')->assertMissing('avatars/test.jpg');
});

it('restricts avatar management to authenticated users', function () {
    $this->post('/settings/profile/avatar')
        ->assertRedirect('/login');

    $this->delete('/settings/profile/avatar')
        ->assertRedirect('/login');
});
