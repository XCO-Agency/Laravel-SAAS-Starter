<?php

use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->admin = User::factory()->create(['is_superadmin' => true]);
});

it('allows superadmin to download revenue CSV', function () {
    $this->actingAs($this->admin)
        ->get('/admin/revenue-analytics/export')
        ->assertOk()
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});

it('requires authentication for revenue export', function () {
    $this->get('/admin/revenue-analytics/export')->assertRedirect('/login');
});

it('forbids non-superadmin from exporting revenue', function () {
    $user = User::factory()->create(['is_superadmin' => false]);

    $this->actingAs($user)
        ->get('/admin/revenue-analytics/export')
        ->assertForbidden();
});

it('CSV contains expected headers', function () {
    $response = $this->actingAs($this->admin)
        ->get('/admin/revenue-analytics/export');

    $content = $response->streamedContent();
    expect($content)->toContain('Workspace ID');
    expect($content)->toContain('Workspace Name');
    expect($content)->toContain('Plan');
    expect($content)->toContain('Status');
    expect($content)->toContain('Estimated MRR ($)');
    expect($content)->toContain('Started At');
});

it('CSV contains subscription data', function () {
    $workspace = Workspace::factory()->create(['name' => 'Acme Corp']);

    $workspace->subscriptions()->create([
        'type' => 'default',
        'stripe_id' => 'sub_test_'.uniqid(),
        'stripe_status' => 'active',
        'stripe_price' => 'price_pro_monthly',
    ]);

    $response = $this->actingAs($this->admin)
        ->get('/admin/revenue-analytics/export')
        ->assertOk();

    $content = $response->streamedContent();
    expect($content)->toContain('Acme Corp');
    expect($content)->toContain('active');
});

it('CSV filename contains today date', function () {
    $response = $this->actingAs($this->admin)
        ->get('/admin/revenue-analytics/export');

    $disposition = $response->headers->get('Content-Disposition');
    expect($disposition)->toContain(now()->format('Y-m-d'));
});

it('CSV is empty of data rows when no subscriptions exist', function () {
    $response = $this->actingAs($this->admin)
        ->get('/admin/revenue-analytics/export');

    $content = $response->streamedContent();
    $lines = array_filter(explode("\n", trim($content)));
    // Only the header row
    expect(count($lines))->toBe(1);
});
