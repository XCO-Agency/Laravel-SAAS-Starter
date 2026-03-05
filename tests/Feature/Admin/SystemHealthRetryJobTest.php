<?php

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->superadmin = User::factory()->create(['is_superadmin' => true]);
});

it('allows superadmin to retry a failed job', function () {
    DB::table('failed_jobs')->insert([
        'uuid' => Str::uuid(),
        'connection' => 'database',
        'queue' => 'default',
        'payload' => json_encode(['displayName' => 'App\\Jobs\\TestJob']),
        'exception' => 'RuntimeException: Something went wrong',
        'failed_at' => now(),
    ]);

    $jobId = DB::table('failed_jobs')->first()->id;

    actingAs($this->superadmin)
        ->postJson("/admin/system-health/jobs/{$jobId}/retry")
        ->assertOk()
        ->assertJson(['success' => true, 'message' => 'Job queued for retry.']);
});

it('returns 404 when retrying a non-existent job', function () {
    actingAs($this->superadmin)
        ->postJson('/admin/system-health/jobs/9999/retry')
        ->assertNotFound();
});

it('blocks regular users from retrying jobs', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->postJson('/admin/system-health/jobs/1/retry')
        ->assertForbidden();
});
