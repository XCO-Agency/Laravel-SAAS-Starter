<?php

use App\Models\Feedback;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\DB;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->superadmin = User::factory()->create(['is_superadmin' => true]);
    $this->user = User::factory()->create();
});

it('allows superadmin to view the retention page', function () {
    actingAs($this->superadmin)
        ->get('/admin/retention')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/retention')->has('policies'));
});

it('blocks regular users from the retention page', function () {
    actingAs($this->user)
        ->get('/admin/retention')
        ->assertForbidden();
});

it('prunes old read notifications via the command', function () {
    // Create an old read notification (91 days ago)
    DB::table('notifications')->insert([
        'id' => \Illuminate\Support\Str::uuid(),
        'type' => 'App\\Notifications\\SystemMessage',
        'notifiable_type' => User::class,
        'notifiable_id' => $this->user->id,
        'data' => json_encode(['title' => 'Old']),
        'read_at' => now()->subDays(91),
        'created_at' => now()->subDays(91),
        'updated_at' => now()->subDays(91),
    ]);

    // Create a recent read notification (5 days ago) — should survive
    DB::table('notifications')->insert([
        'id' => \Illuminate\Support\Str::uuid(),
        'type' => 'App\\Notifications\\SystemMessage',
        'notifiable_type' => User::class,
        'notifiable_id' => $this->user->id,
        'data' => json_encode(['title' => 'Recent']),
        'read_at' => now()->subDays(5),
        'created_at' => now()->subDays(5),
        'updated_at' => now()->subDays(5),
    ]);

    $this->artisan('app:prune-old-records')->assertSuccessful();

    expect(DB::table('notifications')->where('notifiable_id', $this->user->id)->count())->toBe(1);
});

it('does not delete anything during a dry run', function () {
    DB::table('notifications')->insert([
        'id' => \Illuminate\Support\Str::uuid(),
        'type' => 'App\\Notifications\\SystemMessage',
        'notifiable_type' => User::class,
        'notifiable_id' => $this->user->id,
        'data' => json_encode(['title' => 'Old']),
        'read_at' => now()->subDays(200),
        'created_at' => now()->subDays(200),
        'updated_at' => now()->subDays(200),
    ]);

    $before = DB::table('notifications')->where('notifiable_id', $this->user->id)->count();

    $this->artisan('app:prune-old-records', ['--dry-run' => true])->assertSuccessful();

    expect(DB::table('notifications')->where('notifiable_id', $this->user->id)->count())->toBe($before);
});

it('prunes old archived feedback via the command', function () {
    $workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);

    // Old archived feedback — should be pruned
    Feedback::factory()->create([
        'user_id' => $this->user->id,
        'workspace_id' => $workspace->id,
        'status' => 'archived',
        'created_at' => now()->subDays(200),
        'updated_at' => now()->subDays(200),
    ]);

    // Old but NOT archived — should survive
    Feedback::factory()->create([
        'user_id' => $this->user->id,
        'workspace_id' => $workspace->id,
        'status' => 'new',
        'created_at' => now()->subDays(200),
        'updated_at' => now()->subDays(200),
    ]);

    $this->artisan('app:prune-old-records')->assertSuccessful();

    expect(Feedback::where('user_id', $this->user->id)->count())->toBe(1);
});

it('allows superadmin to trigger pruning via the API endpoint', function () {
    actingAs($this->superadmin)
        ->postJson('/admin/retention/prune', ['dry_run' => true])
        ->assertOk()
        ->assertJsonStructure(['success', 'output', 'dry_run']);
});
