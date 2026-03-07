<?php

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Services\CsvImportService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;

function setupCsvImportWorkspace(): array
{
    $owner = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
    $workspace->users()->attach($owner->id, ['role' => 'owner']);
    $owner->switchWorkspace($workspace);

    return [$owner, $workspace];
}

function createCsvFile(string $content, string $filename = 'import.csv'): UploadedFile
{
    return UploadedFile::fake()->createWithContent($filename, $content);
}

it('displays the CSV import page for workspace owners', function () {
    [$owner, $workspace] = setupCsvImportWorkspace();

    $this->actingAs($owner)
        ->get('/team/import')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Team/import')
            ->has('workspace')
            ->where('workspace.id', $workspace->id)
            ->has('canInvite')
            ->has('memberLimitMessage')
        );
});

it('prevents non-admin access to CSV import', function () {
    [$owner, $workspace] = setupCsvImportWorkspace();
    $member = User::factory()->create();
    $workspace->users()->attach($member->id, ['role' => 'member']);
    $member->switchWorkspace($workspace);

    $this->actingAs($member)
        ->get('/team/import')
        ->assertForbidden();
});

it('previews a valid CSV file', function () {
    Notification::fake();
    [$owner, $workspace] = setupCsvImportWorkspace();

    $csv = "email,role\njane@example.com,member\njohn@example.com,admin\n";
    $file = createCsvFile($csv);

    $this->actingAs($owner)
        ->post('/team/import/preview', ['csv_file' => $file])
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Team/import')
            ->has('preview')
            ->where('preview.valid', 2)
            ->where('preview.invalid', 0)
            ->where('preview.skipped', 0)
            ->has('preview.rows', 2)
            ->where('preview.rows.0.email', 'jane@example.com')
            ->where('preview.rows.0.role', 'member')
            ->where('preview.rows.0.status', 'valid')
            ->where('preview.rows.1.email', 'john@example.com')
            ->where('preview.rows.1.role', 'admin')
            ->where('preview.rows.1.status', 'valid')
        );

    // Preview should NOT send any invitations
    Notification::assertNothingSent();
});

it('detects invalid emails in CSV', function () {
    [$owner, $workspace] = setupCsvImportWorkspace();

    $csv = "email,role\nnot-an-email,member\n,admin\njane@example.com,member\n";
    $file = createCsvFile($csv);

    $this->actingAs($owner)
        ->post('/team/import/preview', ['csv_file' => $file])
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('preview.valid', 1)
            ->where('preview.invalid', 2)
            ->where('preview.skipped', 0)
        );
});

it('skips existing workspace members', function () {
    [$owner, $workspace] = setupCsvImportWorkspace();
    $existingMember = User::factory()->create(['email' => 'existing@example.com']);
    $workspace->users()->attach($existingMember->id, ['role' => 'member']);

    $csv = "email,role\nexisting@example.com,member\nnew@example.com,member\n";
    $file = createCsvFile($csv);

    $this->actingAs($owner)
        ->post('/team/import/preview', ['csv_file' => $file])
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('preview.valid', 1)
            ->where('preview.skipped', 1)
            ->where('preview.rows.0.status', 'skipped')
            ->where('preview.rows.0.error', 'Already a member')
            ->where('preview.rows.1.status', 'valid')
        );
});

it('skips already invited emails', function () {
    [$owner, $workspace] = setupCsvImportWorkspace();
    WorkspaceInvitation::create([
        'workspace_id' => $workspace->id,
        'email' => 'invited@example.com',
        'role' => 'member',
    ]);

    $csv = "email,role\ninvited@example.com,member\nnew@example.com,member\n";
    $file = createCsvFile($csv);

    $this->actingAs($owner)
        ->post('/team/import/preview', ['csv_file' => $file])
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('preview.valid', 1)
            ->where('preview.skipped', 1)
            ->where('preview.rows.0.error', 'Already invited')
        );
});

it('skips duplicate emails within the CSV', function () {
    [$owner, $workspace] = setupCsvImportWorkspace();

    $csv = "email,role\njane@example.com,member\njane@example.com,admin\n";
    $file = createCsvFile($csv);

    $this->actingAs($owner)
        ->post('/team/import/preview', ['csv_file' => $file])
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('preview.valid', 1)
            ->where('preview.skipped', 1)
            ->where('preview.rows.1.error', 'Duplicate in CSV')
        );
});

it('defaults to member role when role column is missing', function () {
    [$owner, $workspace] = setupCsvImportWorkspace();

    $csv = "email\njane@example.com\njohn@example.com\n";
    $file = createCsvFile($csv);

    $this->actingAs($owner)
        ->post('/team/import/preview', ['csv_file' => $file])
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('preview.valid', 2)
            ->where('preview.rows.0.role', 'member')
            ->where('preview.rows.1.role', 'member')
        );
});

it('defaults to member role when role is unrecognized', function () {
    [$owner, $workspace] = setupCsvImportWorkspace();

    $csv = "email,role\njane@example.com,superadmin\njohn@example.com,editor\n";
    $file = createCsvFile($csv);

    $this->actingAs($owner)
        ->post('/team/import/preview', ['csv_file' => $file])
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('preview.rows.0.role', 'member')
            ->where('preview.rows.1.role', 'member')
        );
});

it('processes CSV import and sends invitations', function () {
    Notification::fake();
    [$owner, $workspace] = setupCsvImportWorkspace();

    $csv = "email,role\njane@example.com,member\n";
    $file = createCsvFile($csv);

    $this->actingAs($owner)
        ->post('/team/import/process', ['csv_file' => $file])
        ->assertRedirect(route('team.index'));

    // Verify invitation was created (free plan allows 2 total members, owner is 1)
    expect(WorkspaceInvitation::where('workspace_id', $workspace->id)->count())->toBe(1);
    expect(WorkspaceInvitation::where('email', 'jane@example.com')->where('role', 'member')->exists())->toBeTrue();
});

it('does not send invitations for invalid or skipped rows during process', function () {
    Notification::fake();
    [$owner, $workspace] = setupCsvImportWorkspace();

    $csv = "email,role\nnot-email,member\njane@example.com,member\n";
    $file = createCsvFile($csv);

    $this->actingAs($owner)
        ->post('/team/import/process', ['csv_file' => $file])
        ->assertRedirect(route('team.index'));

    // Only the valid row should create an invitation (invalid row skipped)
    expect(WorkspaceInvitation::where('workspace_id', $workspace->id)->count())->toBe(1);
    expect(WorkspaceInvitation::where('email', 'jane@example.com')->exists())->toBeTrue();
});

it('rejects non-CSV file uploads', function () {
    [$owner, $workspace] = setupCsvImportWorkspace();

    $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

    $this->actingAs($owner)
        ->post('/team/import/preview', ['csv_file' => $file])
        ->assertSessionHasErrors('csv_file');
});

it('rejects requests without a file', function () {
    [$owner, $workspace] = setupCsvImportWorkspace();

    $this->actingAs($owner)
        ->post('/team/import/preview', [])
        ->assertSessionHasErrors('csv_file');
});

it('handles empty CSV file gracefully', function () {
    [$owner, $workspace] = setupCsvImportWorkspace();

    $csv = "email,role\n";
    $file = createCsvFile($csv);

    $this->actingAs($owner)
        ->post('/team/import/preview', ['csv_file' => $file])
        ->assertRedirect();
});

it('handles case-insensitive email matching', function () {
    [$owner, $workspace] = setupCsvImportWorkspace();
    $existingMember = User::factory()->create(['email' => 'Test@Example.com']);
    $workspace->users()->attach($existingMember->id, ['role' => 'member']);

    $csv = "email,role\ntest@example.com,member\n";
    $file = createCsvFile($csv);

    $this->actingAs($owner)
        ->post('/team/import/preview', ['csv_file' => $file])
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('preview.skipped', 1)
            ->where('preview.rows.0.error', 'Already a member')
        );
});

// Unit-level tests for CsvImportService
it('parses CSV with alternative header names', function () {
    [$owner, $workspace] = setupCsvImportWorkspace();
    $service = app(CsvImportService::class);

    $csv = "E-Mail,Team_Role\njane@example.com,admin\n";
    $file = createCsvFile($csv);

    $result = $service->parse($file, $workspace);

    expect($result['valid'])->toBe(1)
        ->and($result['rows'][0]['email'])->toBe('jane@example.com')
        ->and($result['rows'][0]['role'])->toBe('admin');
});

it('returns empty results when no email column is found', function () {
    [$owner, $workspace] = setupCsvImportWorkspace();
    $service = app(CsvImportService::class);

    $csv = "name,department\nJane,Engineering\n";
    $file = createCsvFile($csv);

    $result = $service->parse($file, $workspace);

    expect($result['rows'])->toBeEmpty()
        ->and($result['valid'])->toBe(0);
});

it('prevents non-admin member from processing CSV import', function () {
    [$owner, $workspace] = setupCsvImportWorkspace();
    $member = User::factory()->create();
    $workspace->users()->attach($member->id, ['role' => 'member']);
    $member->switchWorkspace($workspace);

    $csv = "email,role\njane@example.com,member\n";
    $file = createCsvFile($csv);

    $this->actingAs($member)
        ->post('/team/import/process', ['csv_file' => $file])
        ->assertForbidden();

    expect(WorkspaceInvitation::where('workspace_id', $workspace->id)->count())->toBe(0);
});
