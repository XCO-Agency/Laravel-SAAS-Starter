<?php

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    $this->superadmin = User::factory()->create(['is_superadmin' => true]);
    $workspace = Workspace::factory()->create([
        'owner_id' => $this->superadmin->id,
        'personal_workspace' => true,
    ]);
    $workspace->addUser($this->superadmin, 'owner');
    $this->superadmin->switchWorkspace($workspace);

    // Ensure app is up before each test
    if (app()->isDownForMaintenance()) {
        \Artisan::call('up');
    }
});

afterEach(function () {
    // Always bring app back up after tests
    if (app()->isDownForMaintenance()) {
        \Artisan::call('up');
    }
    Cache::forget('maintenance_mode');
});

describe('Maintenance Mode Page', function () {
    it('displays maintenance page for superadmin', function () {
        $this->actingAs($this->superadmin)
            ->get('/admin/maintenance')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/maintenance')
                ->has('maintenance')
                ->has('isDown')
            );
    });

    it('prevents non-superadmin from accessing maintenance page', function () {
        $user = User::factory()->create(['is_superadmin' => false]);
        $workspace = Workspace::factory()->create([
            'owner_id' => $user->id,
            'personal_workspace' => true,
        ]);
        $workspace->addUser($user, 'owner');
        $user->switchWorkspace($workspace);

        $this->actingAs($user)
            ->get('/admin/maintenance')
            ->assertForbidden();
    });
});

describe('Maintenance Mode Toggle', function () {
    it('stores maintenance config in cache when toggling', function () {
        $this->actingAs($this->superadmin)
            ->post('/admin/maintenance/toggle', [
                'message' => 'Under maintenance',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $config = Cache::get('maintenance_mode');
        expect($config)->not->toBeNull();
        expect($config['active'])->toBeTrue();
        expect($config['message'])->toBe('Under maintenance');
        expect($config['secret'])->not->toBeEmpty();
    });

    it('validates message length', function () {
        $this->actingAs($this->superadmin)
            ->post('/admin/maintenance/toggle', [
                'message' => str_repeat('a', 501),
            ])
            ->assertSessionHasErrors('message');
    });

    it('prevents non-superadmin from toggling', function () {
        $user = User::factory()->create(['is_superadmin' => false]);
        $workspace = Workspace::factory()->create([
            'owner_id' => $user->id,
            'personal_workspace' => true,
        ]);
        $workspace->addUser($user, 'owner');
        $user->switchWorkspace($workspace);

        $this->actingAs($user)
            ->post('/admin/maintenance/toggle', [])
            ->assertForbidden();
    });
});
