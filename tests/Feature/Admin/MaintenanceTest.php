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
            ->assertInertia(
                fn ($page) => $page
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

    it('stores allowed_ips correctly from string', function () {
        $this->actingAs($this->superadmin)
            ->post('/admin/maintenance/toggle', [
                'message' => 'Under maintenance',
                'allowed_ips' => '192.168.1.1, 10.0.0.5 , invalid-ip, 127.0.0.1',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $config = Cache::get('maintenance_mode');
        expect($config['allowed_ips'])->toBe(['192.168.1.1', '10.0.0.5', '127.0.0.1']);
    });
});

describe('Maintenance IP Whitelist Middleware', function () {
    it('bypasses maintenance mode for whitelisted IP', function () {
        // Toggle maintenance mode on with a whitelisted IP
        $this->actingAs($this->superadmin)
            ->post('/admin/maintenance/toggle', [
                'allowed_ips' => '127.0.0.1',
            ]);

        // Assert it is actually down
        expect(app()->isDownForMaintenance())->toBeTrue();

        // Make a request from the whitelisted IP
        $response = $this->withServerVariables(['REMOTE_ADDR' => '127.0.0.1'])->get('/');

        // It should let us through (since we're unauthenticated it hits the welcome page)
        $response->assertStatus(200);
    });

    it('blocks non-whitelisted IP during maintenance mode', function () {
        // Toggle maintenance mode on with a whitelisted IP
        $this->actingAs($this->superadmin)
            ->post('/admin/maintenance/toggle', [
                'allowed_ips' => '192.168.1.1',
            ]);

        expect(app()->isDownForMaintenance())->toBeTrue();

        // Make a request from a blocked IP
        $response = $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.5'])->get('/');

        // It should return 503 Maintenance Mode
        $response->assertStatus(503);
    });
});
