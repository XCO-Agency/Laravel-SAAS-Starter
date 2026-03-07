<?php

use App\Models\User;
use Illuminate\Support\Facades\File;

beforeEach(function () {
    $this->superadmin = User::factory()->create(['is_superadmin' => true]);
    $this->admin = User::factory()->create(); // standard user for admin tests
    $this->standardUser = User::factory()->create();

    // Create a dummy log file for testing
    $this->dummyLogPath = storage_path('logs/test-dummy.log');
    $this->dummyLogContent = <<<LOG
[2023-01-01 12:00:00] local.INFO: Application started
[2023-01-01 12:05:00] local.ERROR: Something went wrong
Stack trace:
#0 dummy
LOG;
    File::put($this->dummyLogPath, $this->dummyLogContent);
});

afterEach(function () {
    if (File::exists($this->dummyLogPath)) {
        File::delete($this->dummyLogPath);
    }
});

it('prevents non-superadmins from accessing the log viewer', function () {
    $this->actingAs($this->admin)->get(route('admin.logs.index'))->assertForbidden();
    $this->actingAs($this->standardUser)->get(route('admin.logs.index'))->assertForbidden();
});

it('allows superadmin to view the log file list', function () {
    $response = $this->actingAs($this->superadmin)->get(route('admin.logs.index'));

    $response->assertSuccessful();
    $response->assertInertia(
        fn($page) => $page
            ->component('admin/logs')
            ->has('files')
    );
});

it('allows superadmin to view a specific log file', function () {
    $response = $this->actingAs($this->superadmin)->get(route('admin.logs.show', 'test-dummy.log'));

    $response->assertSuccessful();
    $response->assertInertia(
        fn($page) => $page
            ->component('admin/logs')
            ->where('currentFile.name', 'test-dummy.log')
            ->has('logs', 2)
            ->where('logs.0.level', 'ERROR') // Latest first
            ->where('logs.1.level', 'INFO')
    );
});

it('prevents directory traversal attacks', function () {
    $this->actingAs($this->superadmin)->get(route('admin.logs.show', '../test.log'))->assertForbidden();
    $this->actingAs($this->superadmin)->delete(route('admin.logs.destroy', '../test.log'))->assertForbidden();
    $this->actingAs($this->superadmin)->get(route('admin.logs.download', '../test.log'))->assertForbidden();
});

it('allows superadmin to delete a log file', function () {
    $this->actingAs($this->superadmin)
        ->delete(route('admin.logs.destroy', 'test-dummy.log'))
        ->assertRedirect(route('admin.logs.index'))
        ->assertSessionHas('success');

    expect(File::exists($this->dummyLogPath))->toBeFalse();
});

it('allows superadmin to download a log file', function () {
    $response = $this->actingAs($this->superadmin)
        ->get(route('admin.logs.download', 'test-dummy.log'));

    $response->assertSuccessful();
    $response->assertDownload('test-dummy.log');
});
