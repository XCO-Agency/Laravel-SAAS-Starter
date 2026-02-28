<?php

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\Hash;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create([
        'password' => Hash::make('password123'),
    ]);
});

it('can delete account with correct password', function () {
    $response = $this->actingAs($this->user)
        ->delete(route('profile.destroy'), [
            'password' => 'password123',
        ]);

    $response->assertRedirect('/');
    
    $this->assertSoftDeleted('users', [
        'id' => $this->user->id,
    ]);
    
    $this->assertGuest();
});

it('cannot delete account with incorrect password', function () {
    $response = $this->actingAs($this->user)
        ->from(route('profile.edit'))
        ->delete(route('profile.destroy'), [
            'password' => 'wrong-password',
        ]);

    $response->assertRedirect(route('profile.edit'));
    $response->assertSessionHasErrors('password');
    
    $this->assertDatabaseHas('users', [
        'id' => $this->user->id,
        'deleted_at' => null,
    ]);
});

it('deletes owned personal workspaces when user is deleted', function () {
    $workspace = Workspace::factory()->create([
        'owner_id' => $this->user->id,
        'personal_workspace' => true,
    ]);
    $workspace->users()->attach($this->user->id, ['role' => 'owner']);

    $this->actingAs($this->user)
        ->delete(route('profile.destroy'), [
            'password' => 'password123',
        ]);

    $this->assertSoftDeleted('workspaces', [
        'id' => $workspace->id,
    ]);
});

it('prevents deletion if user owns a shared workspace with other members', function () {
    $workspace = Workspace::factory()->create([
        'owner_id' => $this->user->id,
        'personal_workspace' => false,
    ]);
    $workspace->users()->attach($this->user->id, ['role' => 'owner']);
    
    $otherUser = User::factory()->create();
    $workspace->users()->attach($otherUser->id, ['role' => 'member']);

    $response = $this->actingAs($this->user)
        ->from(route('profile.edit'))
        ->delete(route('profile.destroy'), [
            'password' => 'password123',
        ]);

    $response->assertRedirect(route('profile.edit'));
    $response->assertSessionHasErrors('account');
    
    $this->assertDatabaseHas('users', [
        'id' => $this->user->id,
        'deleted_at' => null,
    ]);
});
