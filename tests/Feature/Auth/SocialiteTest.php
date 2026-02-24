<?php

use App\Models\ConnectedAccount;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery as m;

use Laravel\Socialite\Contracts\Provider;

uses(RefreshDatabase::class);

beforeEach(function () {
    /** @var \Mockery\MockInterface&Provider $mockProvider */
    $mockProvider = m::mock(Provider::class);
    $this->mockProvider = $mockProvider;

    Socialite::shouldReceive('driver')
        ->with('github')
        ->andReturn($mockProvider);
});

it('redirects to the provider', function () {
    $this->mockProvider->shouldReceive('redirect')
        ->andReturn(redirect('https://github.com/login/oauth/authorize'));

    $response = $this->get('/auth/github/redirect');
    $response->assertRedirect('https://github.com/login/oauth/authorize');
});

it('creates a new user and connected account on successful fresh callback', function () {
    $socialiteUser = new SocialiteUser();
    $socialiteUser->map([
        'id' => 'github_123',
        'nickname' => 'johndoe',
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'avatar' => 'https://example.com/avatar.jpg',
    ]);
    
    $socialiteUser->token = 'fake_token';

    $this->mockProvider->shouldReceive('user')->andReturn($socialiteUser);

    $this->assertDatabaseMissing('users', ['email' => 'john@example.com']);

    $response = $this->get('/auth/github/callback');

    $response->assertRedirect(route('dashboard', absolute: false));

    $this->assertAuthenticated();

    $user = User::where('email', 'john@example.com')->first();
    $this->assertNotNull($user);
    $this->assertEquals('John Doe', $user->name);
    
    $this->assertNotNull($user->email_verified_at);

    // Assert Workspace logic works
    $this->assertCount(1, $user->workspaces);
    $this->assertTrue((bool)$user->workspaces->first()->personal_workspace);

    // Assert Connection logic works
    $this->assertCount(1, $user->connectedAccounts);
    $connection = $user->connectedAccounts->first();
    $this->assertEquals('github', $connection->provider);
    $this->assertEquals('github_123', $connection->provider_id);
    $this->assertEquals('fake_token', $connection->token);
});

it('logs in an existing connected account automatically', function () {
    $user = User::factory()->create();
    
    ConnectedAccount::create([
        'user_id' => $user->id,
        'provider' => 'github',
        'provider_id' => 'github_456',
        'token' => 'old_token',
    ]);

    $socialiteUser = new SocialiteUser();
    $socialiteUser->map([
        'id' => 'github_456',
        'email' => $user->email,
    ]);
    $socialiteUser->token = 'new_token';
    $socialiteUser->expiresIn = 3600;

    $this->mockProvider->shouldReceive('user')->andReturn($socialiteUser);

    $response = $this->get('/auth/github/callback');

    $response->assertRedirect(route('dashboard', absolute: false));
    $this->assertAuthenticatedAs($user);

    $connection = $user->connectedAccounts()->first();
    $this->assertEquals('new_token', $connection->token); // Token should update
    $this->assertNotNull($connection->expires_at);
});

it('attaches to existing email account if a connection does not exist yet', function () {
    $user = User::factory()->create(['email' => 'existing@example.com']);
    
    $this->assertCount(0, $user->connectedAccounts);

    $socialiteUser = new SocialiteUser();
    $socialiteUser->map([
        'id' => 'github_789',
        'email' => 'existing@example.com',
    ]);
    $socialiteUser->token = 'token_789';

    $this->mockProvider->shouldReceive('user')->andReturn($socialiteUser);

    $response = $this->get('/auth/github/callback');
    $response->assertRedirect(route('dashboard', absolute: false));

    $this->assertAuthenticatedAs($user);
    
    // User should now have exactly 1 connection mapped correctly
    $user->refresh();
    $this->assertCount(1, $user->connectedAccounts);
    $this->assertEquals('github_789', $user->connectedAccounts->first()->provider_id);
});
