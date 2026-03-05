<?php

use App\Models\User;
use App\Models\Workspace;

function createOnboardedUserWithWorkspace(bool $suspended = false): User
{
    $user = User::factory()->create([
        'onboarded_at' => now(),
        'email_verified_at' => now(),
    ]);

    $workspace = Workspace::factory()->create([
        'owner_id' => $user->id,
        'personal_workspace' => true,
        'suspended_at' => $suspended ? now() : null,
        'suspension_reason' => $suspended ? 'Testing suspension page' : null,
    ]);

    $workspace->addUser($user, 'owner');
    $user->switchWorkspace($workspace);

    return $user;
}

it('renders onboarding wizard component for unonboarded users', function () {
    $user = User::factory()->create([
        'onboarded_at' => null,
        'email_verified_at' => now(),
    ]);

    $this->actingAs($user)
        ->get('/onboarding')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('onboarding/wizard'));
});

it('renders settings pages with direct inertia components', function (string $uri, string $component) {
    $user = createOnboardedUserWithWorkspace();

    $this->actingAs($user)
        ->get($uri)
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component($component));
})->with([
    ['uri' => '/settings/profile', 'component' => 'settings/profile'],
    ['uri' => '/settings/password', 'component' => 'settings/password'],
    ['uri' => '/settings/appearance', 'component' => 'settings/appearance'],
    ['uri' => '/settings/notifications', 'component' => 'settings/notifications'],
]);

it('redirects from workspaces create when workspace limit is reached', function () {
    $user = createOnboardedUserWithWorkspace();

    $this->actingAs($user)
        ->get('/workspaces/create')
        ->assertRedirect('/workspaces')
        ->assertSessionHas('error');
});

it('renders workspace suspended page component when current workspace is suspended', function () {
    $user = createOnboardedUserWithWorkspace(suspended: true);

    $this->actingAs($user)
        ->get('/workspace/suspended')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('workspace-suspended'));
});

it('renders admin users page component for superadmins', function () {
    $user = createOnboardedUserWithWorkspace();
    $user->update(['is_superadmin' => true]);

    $this->actingAs($user)
        ->get('/admin/users')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/users'));
});
