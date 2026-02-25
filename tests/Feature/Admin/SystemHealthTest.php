<?php

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->superadmin = User::factory()->create(['is_superadmin' => true]);
    $this->user = User::factory()->create();
});

it('allows superadmin to view the system health page', function () {
    actingAs($this->superadmin)
        ->get('/admin/system-health')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/system-health')
            ->has('stats')
            ->has('failedJobs')
        );
});

it('blocks regular users from the system health page', function () {
    actingAs($this->user)
        ->get('/admin/system-health')
        ->assertForbidden();
});

it('returns correct stat keys', function () {
    actingAs($this->superadmin)
        ->get('/admin/system-health')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('stats.pending_jobs')
            ->has('stats.failed_jobs')
            ->has('stats.db_size')
            ->has('stats.cache_driver')
            ->has('stats.queue_driver')
            ->has('stats.session_driver')
            ->has('stats.php_version')
            ->has('stats.laravel_version')
            ->has('stats.storage')
        );
});

it('lists failed jobs when they exist', function () {
    DB::table('failed_jobs')->insert([
        'uuid' => Str::uuid(),
        'connection' => 'database',
        'queue' => 'default',
        'payload' => json_encode(['displayName' => 'App\\Jobs\\TestJob']),
        'exception' => 'RuntimeException: Something went wrong',
        'failed_at' => now(),
    ]);

    actingAs($this->superadmin)
        ->get('/admin/system-health')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('failedJobs', 1)
            ->where('failedJobs.0.job_name', 'TestJob')
        );
});

it('allows superadmin to delete a failed job', function () {
    DB::table('failed_jobs')->insert([
        'uuid' => Str::uuid(),
        'connection' => 'database',
        'queue' => 'default',
        'payload' => json_encode(['displayName' => 'App\\Jobs\\TestJob']),
        'exception' => 'Error',
        'failed_at' => now(),
    ]);

    $jobId = DB::table('failed_jobs')->first()->id;

    actingAs($this->superadmin)
        ->deleteJson("/admin/system-health/jobs/{$jobId}")
        ->assertOk()
        ->assertJson(['success' => true]);

    expect(DB::table('failed_jobs')->count())->toBe(0);
});

it('allows superadmin to flush all failed jobs', function () {
    DB::table('failed_jobs')->insert([
        'uuid' => Str::uuid(),
        'connection' => 'database',
        'queue' => 'default',
        'payload' => json_encode(['displayName' => 'App\\Jobs\\TestJob']),
        'exception' => 'Error',
        'failed_at' => now(),
    ]);

    DB::table('failed_jobs')->insert([
        'uuid' => Str::uuid(),
        'connection' => 'database',
        'queue' => 'default',
        'payload' => json_encode(['displayName' => 'App\\Jobs\\OtherJob']),
        'exception' => 'Error',
        'failed_at' => now(),
    ]);

    actingAs($this->superadmin)
        ->postJson('/admin/system-health/jobs/flush')
        ->assertOk()
        ->assertJson(['success' => true]);

    expect(DB::table('failed_jobs')->count())->toBe(0);
});

it('returns 404 when deleting a non-existent job', function () {
    actingAs($this->superadmin)
        ->deleteJson('/admin/system-health/jobs/9999')
        ->assertNotFound();
});
