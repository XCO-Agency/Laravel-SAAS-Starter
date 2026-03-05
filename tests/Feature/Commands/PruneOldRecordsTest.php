<?php

use App\Models\Feedback;
use App\Models\WebhookEndpoint;
use App\Models\WebhookLog;
use App\Models\Workspace;
use Illuminate\Support\Facades\DB;

it('prunes old notifications', function () {
    $user = \App\Models\User::factory()->withoutTwoFactor()->create();

    // Create an old read notification
    DB::table('notifications')->insert([
        'id' => \Illuminate\Support\Str::uuid(),
        'type' => 'App\\Notifications\\TestNotification',
        'notifiable_type' => 'App\\Models\\User',
        'notifiable_id' => $user->id,
        'data' => json_encode(['message' => 'test']),
        'read_at' => now()->subDays(200),
        'created_at' => now()->subDays(200),
        'updated_at' => now()->subDays(200),
    ]);

    $this->artisan('app:prune-old-records')
        ->assertSuccessful();

    expect(DB::table('notifications')->count())->toBe(0);
});

it('prunes old webhook logs', function () {
    $workspace = Workspace::factory()->create();
    $endpoint = WebhookEndpoint::factory()->create(['workspace_id' => $workspace->id]);
    WebhookLog::factory()->create([
        'webhook_endpoint_id' => $endpoint->id,
        'created_at' => now()->subDays(200),
    ]);

    $this->artisan('app:prune-old-records')
        ->assertSuccessful();

    expect(WebhookLog::count())->toBe(0);
});

it('prunes old feedback', function () {
    Feedback::factory()->create([
        'status' => 'archived',
        'created_at' => now()->subDays(200),
    ]);

    $this->artisan('app:prune-old-records')
        ->assertSuccessful();

    expect(Feedback::count())->toBe(0);
});

it('supports dry-run mode', function () {
    Feedback::factory()->create([
        'status' => 'archived',
        'created_at' => now()->subDays(200),
    ]);

    $this->artisan('app:prune-old-records', ['--dry-run' => true])
        ->assertSuccessful();

    // Records should still exist in dry-run mode
    expect(Feedback::count())->toBe(1);
});

it('does not prune recent records', function () {
    Feedback::factory()->create([
        'status' => 'archived',
        'created_at' => now(),
    ]);

    $this->artisan('app:prune-old-records')
        ->assertSuccessful();

    expect(Feedback::count())->toBe(1);
});
