<?php

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/**
 * @var TestCase $this
 *
 * @property Workspace $workspace
 * @property User $owner
 * @property User $admin
 * @property User $member
 * @property User $viewer
 */
uses(RefreshDatabase::class);

beforeEach(function () {
    Notification::fake();
    $this->owner = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->owner->id]);
    $this->workspace->users()->attach($this->owner->id, ['role' => Workspace::ROLE_OWNER]);

    $this->admin = User::factory()->create();
    $this->workspace->users()->attach($this->admin->id, ['role' => Workspace::ROLE_ADMIN]);

    $this->member = User::factory()->create();
    $this->workspace->users()->attach($this->member->id, ['role' => Workspace::ROLE_MEMBER]);

    $this->viewer = User::factory()->create();
    $this->workspace->users()->attach($this->viewer->id, ['role' => Workspace::ROLE_VIEWER]);
});

test('owner has all permissions', function () {
    expect($this->workspace->hasPermission($this->owner, 'manage_team'))->toBeTrue();
    expect($this->workspace->hasPermission($this->owner, 'manage_billing'))->toBeTrue();
    expect($this->workspace->hasPermission($this->owner, 'manage_webhooks'))->toBeTrue();
    expect($this->workspace->hasPermission($this->owner, 'view_activity_logs'))->toBeTrue();
});

test('admin has management permissions but not billing', function () {
    expect($this->workspace->hasPermission($this->admin, 'manage_team'))->toBeTrue();
    expect($this->workspace->hasPermission($this->admin, 'manage_webhooks'))->toBeTrue();
    expect($this->workspace->hasPermission($this->admin, 'view_activity_logs'))->toBeTrue();
    expect($this->workspace->hasPermission($this->admin, 'manage_billing'))->toBeFalse();
});

test('member has no management permissions', function () {
    expect($this->workspace->hasPermission($this->member, 'manage_team'))->toBeFalse();
    expect($this->workspace->hasPermission($this->member, 'manage_webhooks'))->toBeFalse();
    expect($this->workspace->hasPermission($this->member, 'manage_billing'))->toBeFalse();
});

test('viewer has only read-only permissions', function () {
    expect($this->workspace->hasPermission($this->viewer, 'view_activity_logs'))->toBeTrue();
    expect($this->workspace->hasPermission($this->viewer, 'manage_team'))->toBeFalse();
    expect($this->workspace->hasPermission($this->viewer, 'manage_webhooks'))->toBeFalse();
});

test('userIsAdmin helper works correctly', function () {
    expect($this->workspace->userIsAdmin($this->owner))->toBeTrue();
    expect($this->workspace->userIsAdmin($this->admin))->toBeTrue();
    expect($this->workspace->userIsAdmin($this->member))->toBeFalse();
    expect($this->workspace->userIsAdmin($this->viewer))->toBeFalse();
});

test('userIsMember helper works correctly', function () {
    expect($this->workspace->userIsMember($this->owner))->toBeTrue();
    expect($this->workspace->userIsMember($this->admin))->toBeTrue();
    expect($this->workspace->userIsMember($this->member))->toBeTrue();
    expect($this->workspace->userIsMember($this->viewer))->toBeFalse();
});

test('userIsViewer helper works correctly', function () {
    expect($this->workspace->userIsViewer($this->owner))->toBeFalse();
    expect($this->workspace->userIsViewer($this->admin))->toBeFalse();
    expect($this->workspace->userIsViewer($this->member))->toBeFalse();
    expect($this->workspace->userIsViewer($this->viewer))->toBeTrue();
});

test('TeamController validates roles correctly', function () {
    $workspace = Workspace::factory()->create(['owner_id' => $this->admin->id]);
    $workspace->users()->attach($this->admin->id, ['role' => Workspace::ROLE_OWNER]);

    $this->admin->update(['current_workspace_id' => $workspace->id]);
    $this->actingAs($this->admin);

    // Test inviting as viewer
    $response = $this->from(route('team.index'))
        ->post(route('team.invite'), [
            'email' => 'new-viewer@example.com',
            'role' => Workspace::ROLE_VIEWER,
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();
    $this->assertDatabaseHas('workspace_invitations', [
        'workspace_id' => $workspace->id,
        'email' => 'new-viewer@example.com',
        'role' => Workspace::ROLE_VIEWER,
    ]);

    // Add a member to test updateRole
    $member = User::factory()->create();
    $workspace->users()->attach($member->id, ['role' => Workspace::ROLE_MEMBER]);

    $response = $this->put(route('team.update-role', $member), [
        'role' => Workspace::ROLE_VIEWER,
    ]);

    $response->assertRedirect();
    expect($workspace->getUserRole($member))->toBe(Workspace::ROLE_VIEWER);
});
