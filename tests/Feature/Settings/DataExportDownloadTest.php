<?php

use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

use function Pest\Laravel\actingAs;

it('allows downloading an export file with a valid signed URL', function () {
    // Write a real file to disk - local disk root is storage/app/private
    $dir = storage_path('app/private/exports');
    if (! is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    file_put_contents($dir.'/test-download.zip', 'fake-zip-content');

    $user = User::factory()->create();
    $url = URL::temporarySignedRoute(
        'security.export-download',
        now()->addHour(),
        ['filename' => 'test-download.zip']
    );

    actingAs($user)
        ->get($url)
        ->assertOk();

    // Clean up
    @unlink($dir.'/test-download.zip');
});

it('returns 404 when export file does not exist', function () {
    $user = User::factory()->create();
    $url = URL::temporarySignedRoute(
        'security.export-download',
        now()->addHour(),
        ['filename' => 'nonexistent-file.zip']
    );

    actingAs($user)
        ->get($url)
        ->assertNotFound();
});

it('rejects download with an invalid signature', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->get('/settings/export-data/test.zip')
        ->assertForbidden();
});

it('requires authentication for export download', function () {
    $url = URL::temporarySignedRoute(
        'security.export-download',
        now()->addHour(),
        ['filename' => 'test.zip']
    );

    $this->get($url)
        ->assertRedirect(route('login'));
});
