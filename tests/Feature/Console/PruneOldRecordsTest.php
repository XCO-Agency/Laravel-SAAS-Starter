<?php

use App\Models\Feedback;
use App\Models\WebhookLog;
use Illuminate\Support\Facades\DB;

use function Pest\Laravel\artisan;

beforeEach(function () {
    // Disable any global pruning during other tests if needed,
    // but here we are specifically testing it.
});

it('prunes old notifications', function () {
    $cfg = config('retention.notifications');
    $days = (int) $cfg['days'];

    // 1. Old read notification
    DB::table('notifications')->insert([
        'id' => 'old-read',
        'type' => 'App\Notifications\Test',
        'notifiable_type' => 'App\Models\User',
        'notifiable_id' => 1,
        'data' => '{}',
        'read_at' => now()->subDays($days + 1),
        'created_at' => now()->subDays($days + 1),
        'updated_at' => now()->subDays($days + 1),
    ]);

    // 2. Old unread notification (should NOT be deleted if read_only is true)
    DB::table('notifications')->insert([
        'id' => 'old-unread',
        'type' => 'App\Notifications\Test',
        'notifiable_type' => 'App\Models\User',
        'notifiable_id' => 1,
        'data' => '{}',
        'read_at' => null,
        'created_at' => now()->subDays($days + 1),
        'updated_at' => now()->subDays($days + 1),
    ]);

    // 3. Recent read notification
    DB::table('notifications')->insert([
        'id' => 'recent-read',
        'type' => 'App\Notifications\Test',
        'notifiable_type' => 'App\Models\User',
        'notifiable_id' => 1,
        'data' => '{}',
        'read_at' => now(),
        'created_at' => now()->subMinutes(10),
        'updated_at' => now()->subMinutes(10),
    ]);

    artisan('app:prune-old-records')
        ->expectsTable(['Model', 'Retention Period', 'Records', 'Action'], [
            ['Notifications', $days.' days (read only)', 1, 'deleted'],
            ['Activity Log', config('retention.activity_log.days').' days', 0, 'deleted'],
            ['Webhook Logs', config('retention.webhook_logs.days').' days', 0, 'deleted'],
            ['Feedback', config('retention.feedback.days').' days (archived only)', 0, 'deleted'],
        ])
        ->assertSuccessful();

    expect(DB::table('notifications')->where('id', 'old-read')->exists())->toBeFalse();
    expect(DB::table('notifications')->where('id', 'old-unread')->exists())->toBeTrue();
    expect(DB::table('notifications')->where('id', 'recent-read')->exists())->toBeTrue();
});

it('prunes old webhook logs', function () {
    $days = (int) config('retention.webhook_logs.days');

    WebhookLog::factory()->create([
        'id' => 'old-log',
        'created_at' => now()->subDays($days + 1),
    ]);

    WebhookLog::factory()->create([
        'id' => 'recent-log',
        'created_at' => now()->subMinutes(10),
    ]);

    artisan('app:prune-old-records')
        ->assertSuccessful();

    expect(WebhookLog::where('id', 'old-log')->exists())->toBeFalse();
    expect(WebhookLog::where('id', 'recent-log')->exists())->toBeTrue();
});

it('prunes old feedback with archived_only constraint', function () {
    $days = (int) config('retention.feedback.days');

    // 1. Old archived feedback (prune)
    $oldArchived = Feedback::factory()->create([
        'status' => 'archived',
        'created_at' => now()->subDays($days + 1),
    ]);

    // 2. Old open feedback (keep)
    $oldOpen = Feedback::factory()->create([
        'status' => 'open',
        'created_at' => now()->subDays($days + 1),
    ]);

    // 3. Recent archived feedback (keep)
    $recentArchived = Feedback::factory()->create([
        'status' => 'archived',
        'created_at' => now()->subMinutes(10),
    ]);

    artisan('app:prune-old-records')
        ->assertSuccessful();

    expect(Feedback::where('id', $oldArchived->id)->exists())->toBeFalse();
    expect(Feedback::where('id', $oldOpen->id)->exists())->toBeTrue();
    expect(Feedback::where('id', $recentArchived->id)->exists())->toBeTrue();
});

it('respects dry-run option', function () {
    $days = (int) config('retention.webhook_logs.days');

    WebhookLog::factory()->create([
        'id' => 'to-be-pruned',
        'created_at' => now()->subDays($days + 1),
    ]);

    artisan('app:prune-old-records', ['--dry-run' => true])
        ->expectsOutputToContain('DRY RUN')
        ->expectsOutputToContain('1 record(s) would be pruned.')
        ->assertSuccessful();

    expect(WebhookLog::where('id', 'to-be-pruned')->exists())->toBeTrue();
});
