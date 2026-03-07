<?php

use App\Models\LoginActivity;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Models\Activity;

function createWorkspaceWithOwner(): array
{
    $owner = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
    $workspace->users()->attach($owner->id, ['role' => 'owner']);
    $owner->switchWorkspace($workspace);

    return [$owner, $workspace];
}

it('displays the member activity report page for workspace admins', function () {
    [$owner, $workspace] = createWorkspaceWithOwner();

    $response = $this->actingAs($owner)->get('/team/activity-report');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Team/activity-report')
        ->has('members')
        ->has('summary')
        ->has('dailyActivity')
    );
});

it('denies access to regular members without manage_team permission', function () {
    [$owner, $workspace] = createWorkspaceWithOwner();
    $member = User::factory()->create();
    $workspace->users()->attach($member->id, ['role' => 'member']);
    $member->switchWorkspace($workspace);

    $response = $this->actingAs($member)->get('/team/activity-report');

    $response->assertForbidden();
});

it('returns correct summary stats', function () {
    [$owner, $workspace] = createWorkspaceWithOwner();

    $member1 = User::factory()->create();
    $member2 = User::factory()->create();
    $workspace->users()->attach($member1->id, ['role' => 'member']);
    $workspace->users()->attach($member2->id, ['role' => 'member']);
    $member1->switchWorkspace($workspace);
    $member2->switchWorkspace($workspace);

    // Create login activities for member1 (recent)
    LoginActivity::factory()->create([
        'user_id' => $member1->id,
        'login_at' => now()->subDay(),
        'is_successful' => true,
    ]);

    $response = $this->actingAs($owner)->get('/team/activity-report');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Team/activity-report')
        ->where('summary.totalMembers', 3)
    );
});

it('calculates engagement score from logins and actions', function () {
    [$owner, $workspace] = createWorkspaceWithOwner();

    // Create 30 successful logins in last 30 days (max login score = 40)
    for ($i = 0; $i < 30; $i++) {
        LoginActivity::factory()->create([
            'user_id' => $owner->id,
            'login_at' => now()->subDays($i),
            'is_successful' => true,
        ]);
    }

    // Create 100 activity log entries (max action score = 60)
    for ($i = 0; $i < 100; $i++) {
        activity('test')
            ->causedBy($owner)
            ->log('Test action');
    }

    $response = $this->actingAs($owner)->get('/team/activity-report');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Team/activity-report')
        ->where('members.0.engagement_score', 100)
    );
});

it('shows last login for members with login activity', function () {
    [$owner, $workspace] = createWorkspaceWithOwner();

    $loginTime = now()->subHours(2);
    LoginActivity::factory()->create([
        'user_id' => $owner->id,
        'login_at' => $loginTime,
        'is_successful' => true,
    ]);

    $response = $this->actingAs($owner)->get('/team/activity-report');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Team/activity-report')
        ->has('members.0.last_login')
    );

    $members = $response->original->getData()['page']['props']['members'];
    expect($members[0]['last_login'])->toStartWith($loginTime->format('Y-m-d\TH:i:s'));
});

it('shows null last_login for members without login activity', function () {
    [$owner, $workspace] = createWorkspaceWithOwner();

    $member = User::factory()->create();
    $workspace->users()->attach($member->id, ['role' => 'member']);
    $member->switchWorkspace($workspace);

    $response = $this->actingAs($owner)->get('/team/activity-report');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Team/activity-report')
        ->where('members.1.last_login', null)
    );
});

it('counts logins in 30-day window', function () {
    [$owner, $workspace] = createWorkspaceWithOwner();

    // 3 logins within 30 days
    LoginActivity::factory()->count(3)->create([
        'user_id' => $owner->id,
        'login_at' => now()->subDays(5),
        'is_successful' => true,
    ]);

    // 2 logins outside 30 days (should not count)
    LoginActivity::factory()->count(2)->create([
        'user_id' => $owner->id,
        'login_at' => now()->subDays(35),
        'is_successful' => true,
    ]);

    $response = $this->actingAs($owner)->get('/team/activity-report');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Team/activity-report')
        ->where('members.0.logins_30d', 3)
    );
});

it('counts actions in 30-day window', function () {
    [$owner, $workspace] = createWorkspaceWithOwner();

    // Recent actions
    for ($i = 0; $i < 5; $i++) {
        activity('test')
            ->causedBy($owner)
            ->log('Recent action');
    }

    // Old actions (outside 30d)
    Carbon::setTestNow(now()->subDays(35));
    for ($i = 0; $i < 3; $i++) {
        activity('test')
            ->causedBy($owner)
            ->log('Old action');
    }
    Carbon::setTestNow();

    $response = $this->actingAs($owner)->get('/team/activity-report');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Team/activity-report')
        ->where('members.0.actions_30d', 5)
    );
});

it('returns 14 days of daily activity data', function () {
    [$owner, $workspace] = createWorkspaceWithOwner();

    $response = $this->actingAs($owner)->get('/team/activity-report');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Team/activity-report')
        ->has('dailyActivity', 14)
    );
});

it('marks members with recent logins as recent status', function () {
    [$owner, $workspace] = createWorkspaceWithOwner();

    LoginActivity::factory()->create([
        'user_id' => $owner->id,
        'login_at' => now()->subDays(3),
        'is_successful' => true,
    ]);

    $response = $this->actingAs($owner)->get('/team/activity-report');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Team/activity-report')
        ->where('members.0.status', 'recent')
    );
});

it('marks members without any logins as inactive', function () {
    [$owner, $workspace] = createWorkspaceWithOwner();

    $member = User::factory()->create();
    $workspace->users()->attach($member->id, ['role' => 'member']);
    $member->switchWorkspace($workspace);

    $response = $this->actingAs($owner)->get('/team/activity-report');

    $response->assertOk();
    $members = $response->original->getData()['page']['props']['members'];
    $hasInactive = collect($members)->contains('status', 'inactive');
    expect($hasInactive)->toBeTrue();
});

it('handles empty workspace with only owner', function () {
    [$owner, $workspace] = createWorkspaceWithOwner();

    $response = $this->actingAs($owner)->get('/team/activity-report');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Team/activity-report')
        ->where('summary.totalMembers', 1)
        ->where('summary.totalActions30d', 0)
    );
});

it('sorts members by engagement score descending', function () {
    [$owner, $workspace] = createWorkspaceWithOwner();

    $activeMember = User::factory()->create();
    $workspace->users()->attach($activeMember->id, ['role' => 'member']);
    $activeMember->switchWorkspace($workspace);

    // Give active member lots of logins
    LoginActivity::factory()->count(20)->create([
        'user_id' => $activeMember->id,
        'login_at' => now()->subDays(2),
        'is_successful' => true,
    ]);

    $response = $this->actingAs($owner)->get('/team/activity-report');

    $response->assertOk();
    $members = $response->original->getData()['page']['props']['members'];
    expect($members[0]['id'])->toBe($activeMember->id);
});
