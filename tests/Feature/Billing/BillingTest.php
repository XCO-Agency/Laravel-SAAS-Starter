<?php

use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->owner->id]);
    $this->workspace->addUser($this->owner, 'owner');
    $this->owner->switchWorkspace($this->workspace);
});

describe('Billing Index', function () {
    it('displays billing overview for workspace owner', function () {
        $this->actingAs($this->owner)
            ->get('/billing')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Billing/index')
                ->has('workspace')
                ->has('plans')
                ->where('userRole', 'owner')
            );
    });

    it('displays billing overview for admin', function () {
        $admin = User::factory()->create();
        $this->workspace->addUser($admin, 'admin');
        $admin->switchWorkspace($this->workspace);

        $this->actingAs($admin)
            ->get('/billing')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Billing/index')
                ->where('userRole', 'admin')
            );
    });

    it('displays billing overview for member', function () {
        $member = User::factory()->create();
        $this->workspace->addUser($member, 'member');
        $member->switchWorkspace($this->workspace);

        $this->actingAs($member)
            ->get('/billing')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Billing/index')
                ->where('userRole', 'member')
            );
    });

    it('requires authentication', function () {
        $this->get('/billing')
            ->assertRedirect('/login');
    });
});

describe('Billing Plans', function () {
    it('displays available plans', function () {
        $this->actingAs($this->owner)
            ->get('/billing/plans')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Billing/plans')
                ->has('plans')
                ->has('currentPlan')
                ->has('currentBillingPeriod')
            );
    });

    it('shows free as current plan for new workspace', function () {
        $this->actingAs($this->owner)
            ->get('/billing/plans')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('currentPlan', 'free')
            );
    });
});

describe('Subscription', function () {
    it('requires owner role to subscribe', function () {
        $member = User::factory()->create();
        $this->workspace->addUser($member, 'member');
        $member->switchWorkspace($this->workspace);

        $this->actingAs($member)
            ->postJson('/billing/subscribe', [
                'plan' => 'pro',
                'billing_period' => 'monthly',
            ])
            ->assertForbidden();
    });

    it('validates plan selection', function () {
        $this->actingAs($this->owner)
            ->postJson('/billing/subscribe', [
                'plan' => 'invalid-plan',
                'billing_period' => 'monthly',
            ])
            ->assertStatus(422);
    });

    it('validates billing period', function () {
        $this->actingAs($this->owner)
            ->postJson('/billing/subscribe', [
                'plan' => 'pro',
                'billing_period' => 'invalid',
            ])
            ->assertStatus(422);
    });

    it('requires owner role to cancel subscription', function () {
        $admin = User::factory()->create();
        $this->workspace->addUser($admin, 'admin');
        $admin->switchWorkspace($this->workspace);

        $this->actingAs($admin)
            ->postJson('/billing/cancel')
            ->assertForbidden();
    });

    it('returns error when cancelling non-existent subscription', function () {
        $this->actingAs($this->owner)
            ->postJson('/billing/cancel')
            ->assertStatus(400)
            ->assertJson([
                'success' => false,
                'error' => 'No active subscription to cancel.',
            ]);
    });

    it('requires owner role to resume subscription', function () {
        $member = User::factory()->create();
        $this->workspace->addUser($member, 'member');
        $member->switchWorkspace($this->workspace);

        $this->actingAs($member)
            ->postJson('/billing/resume')
            ->assertForbidden();
    });

    it('returns error when resuming non-existent subscription', function () {
        $this->actingAs($this->owner)
            ->postJson('/billing/resume')
            ->assertStatus(400)
            ->assertJson([
                'success' => false,
                'error' => 'No subscription to resume.',
            ]);
    });
});

describe('Billing Portal', function () {
    it('requires owner role to access portal', function () {
        $member = User::factory()->create();
        $this->workspace->addUser($member, 'member');
        $member->switchWorkspace($this->workspace);

        $this->actingAs($member)
            ->getJson('/billing/portal')
            ->assertForbidden();
    });

    it('returns error when no stripe customer exists', function () {
        $this->actingAs($this->owner)
            ->getJson('/billing/portal')
            ->assertStatus(400)
            ->assertJson([
                'error' => 'No billing account found. Please subscribe to a plan first.',
            ]);
    });
});
