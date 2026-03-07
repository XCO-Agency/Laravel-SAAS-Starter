<?php

use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->create(['is_superadmin' => true]);
});

describe('Bulk Verify Email', function () {
    it('verifies email for selected unverified users', function () {
        $user1 = User::factory()->create(['email_verified_at' => null]);
        $user2 = User::factory()->create(['email_verified_at' => null]);

        $this->actingAs($this->admin)
            ->post('/admin/users/bulk-verify-email', ['user_ids' => [$user1->id, $user2->id]])
            ->assertRedirect();

        expect($user1->fresh()->email_verified_at)->not->toBeNull()
            ->and($user2->fresh()->email_verified_at)->not->toBeNull();
    });

    it('skips already verified users', function () {
        $verifiedAt = now()->subDay();
        $user = User::factory()->create(['email_verified_at' => $verifiedAt]);

        $this->actingAs($this->admin)
            ->post('/admin/users/bulk-verify-email', ['user_ids' => [$user->id]])
            ->assertRedirect()
            ->assertSessionHas('success', '0 user(s) email verified.');

        // The original timestamp should be preserved
        expect($user->fresh()->email_verified_at->format('Y-m-d H:i:s'))
            ->toBe($verifiedAt->format('Y-m-d H:i:s'));
    });

    it('validates user_ids are required', function () {
        $this->actingAs($this->admin)
            ->post('/admin/users/bulk-verify-email', ['user_ids' => []])
            ->assertSessionHasErrors('user_ids');
    });

    it('prevents non-admin access', function () {
        $user = User::factory()->create(['is_superadmin' => false]);

        $this->actingAs($user)
            ->post('/admin/users/bulk-verify-email', ['user_ids' => [$user->id]])
            ->assertForbidden();
    });
});

describe('Bulk Suspend', function () {
    it('suspends selected users', function () {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $this->actingAs($this->admin)
            ->post('/admin/users/bulk-suspend', ['user_ids' => [$user1->id, $user2->id]])
            ->assertRedirect()
            ->assertSessionHas('success', '2 user(s) suspended.');

        expect($user1->fresh()->deleted_at)->not->toBeNull()
            ->and($user2->fresh()->deleted_at)->not->toBeNull();
    });

    it('prevents admin from suspending themselves', function () {
        $otherUser = User::factory()->create();

        $this->actingAs($this->admin)
            ->post('/admin/users/bulk-suspend', ['user_ids' => [$this->admin->id, $otherUser->id]])
            ->assertRedirect()
            ->assertSessionHas('success', '1 user(s) suspended.');

        // Admin should NOT be suspended
        expect($this->admin->fresh()->deleted_at)->toBeNull()
            ->and($otherUser->fresh()->deleted_at)->not->toBeNull();
    });

    it('prevents non-admin access', function () {
        $user = User::factory()->create(['is_superadmin' => false]);

        $this->actingAs($user)
            ->post('/admin/users/bulk-suspend', ['user_ids' => [$user->id]])
            ->assertForbidden();
    });
});

describe('Bulk Export', function () {
    it('exports selected users as CSV', function () {
        $user1 = User::factory()->create(['name' => 'Alice Export']);
        $user2 = User::factory()->create(['name' => 'Bob Export']);

        $response = $this->actingAs($this->admin)
            ->post('/admin/users/bulk-export', ['user_ids' => [$user1->id, $user2->id]]);

        $response->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');

        $content = $response->streamedContent();
        expect($content)->toContain('Alice Export')
            ->and($content)->toContain('Bob Export')
            ->and($content)->toContain('ID,Name,Email');
    });

    it('includes deleted users in export', function () {
        $user = User::factory()->create(['name' => 'Deleted User']);
        $user->delete();

        $response = $this->actingAs($this->admin)
            ->post('/admin/users/bulk-export', ['user_ids' => [$user->id]]);

        $response->assertOk();
        $content = $response->streamedContent();
        expect($content)->toContain('Deleted User');
    });

    it('prevents non-admin access', function () {
        $user = User::factory()->create(['is_superadmin' => false]);

        $this->actingAs($user)
            ->post('/admin/users/bulk-export', ['user_ids' => [$user->id]])
            ->assertForbidden();
    });
});
