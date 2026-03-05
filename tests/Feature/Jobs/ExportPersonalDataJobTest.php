<?php

use App\Jobs\ExportPersonalDataJob;
use App\Models\User;
use App\Notifications\DataExportCompleted;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

it('creates a zip export file', function () {
    $user = User::factory()->create();

    Notification::fake();

    $job = new ExportPersonalDataJob($user);
    $job->handle();

    // Check that a zip file was created in the local disk's exports directory
    $exportDir = Storage::disk('local')->path('exports');
    $files = glob($exportDir.'/export_'.$user->id.'_*.zip');
    expect($files)->not->toBeEmpty();

    // Clean up
    foreach ($files as $file) {
        @unlink($file);
    }
});

it('sends a DataExportCompleted notification', function () {
    $user = User::factory()->create();

    Notification::fake();

    $job = new ExportPersonalDataJob($user);
    $job->handle();

    Notification::assertSentTo($user, DataExportCompleted::class);

    // Clean up
    $exportDir = Storage::disk('local')->path('exports');
    $files = glob($exportDir.'/export_'.$user->id.'_*.zip');
    foreach ($files as $file) {
        @unlink($file);
    }
});

it('includes personal data JSON in the zip', function () {
    $user = User::factory()->create();

    Notification::fake();

    $job = new ExportPersonalDataJob($user);
    $job->handle();

    $exportDir = Storage::disk('local')->path('exports');
    $files = glob($exportDir.'/export_'.$user->id.'_*.zip');
    expect($files)->not->toBeEmpty();

    $zip = new ZipArchive;
    if ($zip->open($files[0]) === true) {
        $contents = $zip->getFromName('personal_data.json');
        $zip->close();

        expect($contents)->not->toBeFalse();
        $data = json_decode($contents, true);
        expect($data)->toHaveKey('profile');
        expect($data['profile']['email'])->toBe($user->email);
    }

    // Clean up
    foreach ($files as $file) {
        @unlink($file);
    }
});

it('implements ShouldQueue interface', function () {
    expect(ExportPersonalDataJob::class)
        ->toImplement(\Illuminate\Contracts\Queue\ShouldQueue::class);
});
