<?php

use App\Models\LoginActivity;
use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->user = User::factory()->create();
    $workspace = Workspace::factory()->create([
        'owner_id' => $this->user->id,
        'personal_workspace' => true,
    ]);
    $workspace->addUser($this->user, 'owner');
    $this->user->switchWorkspace($workspace);
});

describe('Login Activity Page', function () {
    it('displays login activity page', function () {
        LoginActivity::factory()->count(3)->create(['user_id' => $this->user->id]);

        $this->actingAs($this->user)
            ->get('/settings/login-history')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('settings/login-activity')
                ->has('activities', 3)
            );
    });

    it('only shows activities for authenticated user', function () {
        LoginActivity::factory()->count(2)->create(['user_id' => $this->user->id]);
        $otherUser = User::factory()->create();
        LoginActivity::factory()->count(5)->create(['user_id' => $otherUser->id]);

        $this->actingAs($this->user)
            ->get('/settings/login-history')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('activities', 2)
            );
    });

    it('requires authentication', function () {
        $this->get('/settings/login-history')
            ->assertRedirect('/login');
    });

    it('limits activity results to 50', function () {
        LoginActivity::factory()->count(60)->create(['user_id' => $this->user->id]);

        $this->actingAs($this->user)
            ->get('/settings/login-history')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('activities', 50)
            );
    });
});

describe('Login Activity Model', function () {
    it('parses Chrome on macOS correctly', function () {
        $activity = LoginActivity::factory()->create([
            'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ]);

        expect($activity->parsedDevice())->toBe('Chrome on macOS');
    });

    it('parses Firefox on Windows correctly', function () {
        $activity = LoginActivity::factory()->create([
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
        ]);

        expect($activity->parsedDevice())->toBe('Firefox on Windows');
    });

    it('parses Safari on iOS correctly', function () {
        $activity = LoginActivity::factory()->create([
            'user_agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1',
        ]);

        expect($activity->parsedDevice())->toBe('Safari on iOS');
    });
});

describe('Login Event Listeners', function () {
    it('records successful login', function () {
        // Directly dispatch the Login event to verify the listener works
        event(new \Illuminate\Auth\Events\Login('web', $this->user, false));

        $this->assertDatabaseHas('login_activities', [
            'user_id' => $this->user->id,
            'email' => $this->user->email,
            'is_successful' => true,
        ]);
    });

    it('records failed login attempt', function () {
        $this->post('/login', [
            'email' => $this->user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertDatabaseHas('login_activities', [
            'email' => $this->user->email,
            'is_successful' => false,
        ]);
    });
});
