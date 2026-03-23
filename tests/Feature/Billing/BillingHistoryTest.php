<?php

use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->owner->id]);
    $this->workspace->addUser($this->owner, 'owner');
    $this->owner->switchWorkspace($this->workspace);
});

it('displays billing history page', function () {
    $this->actingAs($this->owner)
        ->get('/billing/history')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Billing/history')
            ->has('invoices')
        );
});

it('shows invoice data in correct format', function () {
    $this->actingAs($this->owner)
        ->get('/billing/history')
        ->assertInertia(fn ($page) => $page
            ->component('Billing/history')
            ->has('invoices')
            ->where('invoices', fn ($invoices) => collect($invoices)->every(fn ($inv) => isset($inv['id']) &&
                    isset($inv['date']) &&
                    isset($inv['total']) &&
                    isset($inv['pdf_url'])
            )
            )
        );
});

it('allows workspace members to view history', function () {
    $member = User::factory()->create();
    $this->workspace->addUser($member, 'member');
    $member->switchWorkspace($this->workspace);

    $this->actingAs($member)
        ->get('/billing/history')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Billing/history')
        );
});

it('requires authentication', function () {
    $this->get('/billing/history')
        ->assertRedirect('/login');
});

it('returns empty array when no invoices', function () {
    $this->actingAs($this->owner)
        ->get('/billing/history')
        ->assertInertia(fn ($page) => $page
            ->component('Billing/history')
            ->where('invoices', [])
        );
});
