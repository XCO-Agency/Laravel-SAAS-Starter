<?php

use App\Models\PermissionPreset;
use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->admin = User::factory()->create(['is_superadmin' => true]);
    $this->user = User::factory()->create();
});

describe('Admin Permission Presets Page', function () {
    it('displays preset management page for superadmin', function () {
        PermissionPreset::create([
            'name' => 'Team Lead',
            'description' => 'Manage team',
            'permissions' => ['manage_team'],
        ]);

        $this->actingAs($this->admin)
            ->get('/admin/permission-presets')
            ->assertOk()
            ->assertInertia(
                fn ($page) => $page
                    ->component('admin/permission-presets')
                    ->has('presets', 1)
                    ->has('availablePermissions', 4)
            );
    });

    it('denies access to non-superadmin users', function () {
        $this->actingAs($this->user)
            ->get('/admin/permission-presets')
            ->assertForbidden();
    });
});

describe('Create Permission Preset', function () {
    it('creates a new preset with valid data', function () {
        $this->actingAs($this->admin)
            ->post('/admin/permission-presets', [
                'name' => 'Content Manager',
                'description' => 'Can manage team and webhooks',
                'permissions' => ['manage_team', 'manage_webhooks'],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('permission_presets', [
            'name' => 'Content Manager',
            'description' => 'Can manage team and webhooks',
        ]);

        $preset = PermissionPreset::where('name', 'Content Manager')->first();
        expect($preset->permissions)->toBe(['manage_team', 'manage_webhooks']);
    });

    it('validates required fields', function () {
        $this->actingAs($this->admin)
            ->post('/admin/permission-presets', [
                'name' => '',
                'permissions' => [],
            ])
            ->assertSessionHasErrors(['name', 'permissions']);
    });

    it('validates unique name', function () {
        PermissionPreset::create([
            'name' => 'Team Lead',
            'permissions' => ['manage_team'],
        ]);

        $this->actingAs($this->admin)
            ->post('/admin/permission-presets', [
                'name' => 'Team Lead',
                'permissions' => ['manage_billing'],
            ])
            ->assertSessionHasErrors('name');
    });

    it('validates permission values against allowed list', function () {
        $this->actingAs($this->admin)
            ->post('/admin/permission-presets', [
                'name' => 'Invalid',
                'permissions' => ['invalid_permission'],
            ])
            ->assertSessionHasErrors('permissions.0');
    });

    it('requires at least one permission', function () {
        $this->actingAs($this->admin)
            ->post('/admin/permission-presets', [
                'name' => 'Empty',
                'permissions' => [],
            ])
            ->assertSessionHasErrors('permissions');
    });
});

describe('Update Permission Preset', function () {
    it('updates an existing preset', function () {
        $preset = PermissionPreset::create([
            'name' => 'Team Lead',
            'permissions' => ['manage_team'],
        ]);

        $this->actingAs($this->admin)
            ->put("/admin/permission-presets/{$preset->id}", [
                'name' => 'Team Lead Updated',
                'description' => 'Updated description',
                'permissions' => ['manage_team', 'view_activity_logs'],
            ])
            ->assertRedirect();

        $preset->refresh();
        expect($preset->name)->toBe('Team Lead Updated')
            ->and($preset->description)->toBe('Updated description')
            ->and($preset->permissions)->toBe(['manage_team', 'view_activity_logs']);
    });

    it('allows keeping same name on update', function () {
        $preset = PermissionPreset::create([
            'name' => 'Team Lead',
            'permissions' => ['manage_team'],
        ]);

        $this->actingAs($this->admin)
            ->put("/admin/permission-presets/{$preset->id}", [
                'name' => 'Team Lead',
                'permissions' => ['manage_team', 'manage_billing'],
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();
    });
});

describe('Delete Permission Preset', function () {
    it('deletes an existing preset', function () {
        $preset = PermissionPreset::create([
            'name' => 'Team Lead',
            'permissions' => ['manage_team'],
        ]);

        $this->actingAs($this->admin)
            ->delete("/admin/permission-presets/{$preset->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('permission_presets', ['id' => $preset->id]);
    });
});

describe('Permission Presets on Team Page', function () {
    it('passes permission presets to team index page', function () {
        $owner = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
        $workspace->addUser($owner, 'owner');
        $owner->switchWorkspace($workspace);

        PermissionPreset::create([
            'name' => 'Team Lead',
            'description' => 'Lead the team',
            'permissions' => ['manage_team'],
        ]);

        PermissionPreset::create([
            'name' => 'Finance',
            'permissions' => ['manage_billing'],
        ]);

        $this->actingAs($owner)
            ->get('/team')
            ->assertOk()
            ->assertInertia(
                fn ($page) => $page
                    ->component('Team/index')
                    ->has('permissionPresets', 2)
                    ->where('permissionPresets.0.name', 'Finance')
                    ->where('permissionPresets.1.name', 'Team Lead')
            );
    });
});

describe('PermissionPreset Model', function () {
    it('casts permissions as array', function () {
        $preset = PermissionPreset::create([
            'name' => 'Ops',
            'permissions' => ['manage_webhooks', 'view_activity_logs'],
        ]);

        $preset->refresh();
        expect($preset->permissions)->toBeArray()
            ->and($preset->permissions)->toBe(['manage_webhooks', 'view_activity_logs']);
    });

    it('has available permissions constant', function () {
        expect(PermissionPreset::AVAILABLE_PERMISSIONS)->toBe([
            'manage_team',
            'manage_billing',
            'manage_webhooks',
            'view_activity_logs',
        ]);
    });
});
