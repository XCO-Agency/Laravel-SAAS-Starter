<?php

use App\Models\CustomFieldDefinition;
use App\Models\CustomFieldValue;
use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->owner->id]);
    $this->owner->workspaces()->attach($this->workspace, ['role' => 'owner']);
    $this->owner->switchWorkspace($this->workspace);

    $this->member = User::factory()->create();
    $this->member->workspaces()->attach($this->workspace, ['role' => 'member']);
    $this->member->switchWorkspace($this->workspace);
});

it('lists workspace custom fields', function () {
    CustomFieldDefinition::factory()->count(3)->forWorkspace($this->workspace)->create();

    $response = $this->actingAs($this->owner)
        ->getJson("/workspaces/{$this->workspace->id}/custom-fields");

    $response->assertOk()
        ->assertJsonCount(3, 'data');
});

it('creates custom field', function () {
    $response = $this->actingAs($this->owner)
        ->postJson("/workspaces/{$this->workspace->id}/custom-fields", [
            'name' => 'Project Code',
            'type' => 'text',
            'required' => true,
            'default_value' => 'PROJ-001',
        ]);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'Project Code')
        ->assertJsonPath('data.type', 'text')
        ->assertJsonPath('data.required', true);

    $this->assertDatabaseHas('custom_field_definitions', [
        'workspace_id' => $this->workspace->id,
        'name' => 'Project Code',
        'type' => 'text',
    ]);
});

it('creates select field with options', function () {
    $response = $this->actingAs($this->owner)
        ->postJson("/workspaces/{$this->workspace->id}/custom-fields", [
            'name' => 'Priority',
            'type' => 'select',
            'options' => ['Low', 'Medium', 'High'],
            'required' => false,
        ]);

    $response->assertCreated()
        ->assertJsonPath('data.type', 'select');

    $this->assertDatabaseHas('custom_field_definitions', [
        'name' => 'Priority',
        'options' => json_encode(['Low', 'Medium', 'High']),
    ]);
});

it('requires options for select type', function () {
    $response = $this->actingAs($this->owner)
        ->postJson("/workspaces/{$this->workspace->id}/custom-fields", [
            'name' => 'Priority',
            'type' => 'select',
            'options' => [],
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['options']);
});

it('generates unique key for duplicate names', function () {
    CustomFieldDefinition::factory()->forWorkspace($this->workspace)->create([
        'name' => 'Project Code',
        'key' => 'project_code',
    ]);

    $response = $this->actingAs($this->owner)
        ->postJson("/workspaces/{$this->workspace->id}/custom-fields", [
            'name' => 'Project Code',
            'type' => 'text',
        ]);

    $response->assertCreated();

    $this->assertDatabaseHas('custom_field_definitions', [
        'key' => 'project_code_1',
        'workspace_id' => $this->workspace->id,
    ]);
});

it('prevents member from creating custom field', function () {
    $response = $this->actingAs($this->member)
        ->postJson("/workspaces/{$this->workspace->id}/custom-fields", [
            'name' => 'New Field',
            'type' => 'text',
        ]);

    $response->assertForbidden();
});

it('updates custom field', function () {
    $field = CustomFieldDefinition::factory()->forWorkspace($this->workspace)->create();

    $response = $this->actingAs($this->owner)
        ->putJson("/workspaces/{$this->workspace->id}/custom-fields/{$field->id}", [
            'name' => 'Updated Name',
            'options' => [],
            'required' => true,
            'default_value' => 'default',
        ]);

    $response->assertOk()
        ->assertJsonPath('data.name', 'Updated Name')
        ->assertJsonPath('data.required', true);
});

it('deletes custom field and its values', function () {
    $field = CustomFieldDefinition::factory()->forWorkspace($this->workspace)->create();
    CustomFieldValue::factory()->create([
        'custom_field_definition_id' => $field->id,
    ]);

    $response = $this->actingAs($this->owner)
        ->deleteJson("/workspaces/{$this->workspace->id}/custom-fields/{$field->id}");

    $response->assertOk();

    $this->assertDatabaseMissing('custom_field_definitions', ['id' => $field->id]);
    $this->assertDatabaseMissing('custom_field_values', ['custom_field_definition_id' => $field->id]);
});

it('reorders custom fields', function () {
    $field1 = CustomFieldDefinition::factory()->forWorkspace($this->workspace)->create(['order' => 0]);
    $field2 = CustomFieldDefinition::factory()->forWorkspace($this->workspace)->create(['order' => 1]);
    $field3 = CustomFieldDefinition::factory()->forWorkspace($this->workspace)->create(['order' => 2]);

    $response = $this->actingAs($this->owner)
        ->postJson("/workspaces/{$this->workspace->id}/custom-fields/reorder", [
            'fields' => [
                ['id' => $field1->id, 'order' => 2],
                ['id' => $field2->id, 'order' => 0],
                ['id' => $field3->id, 'order' => 1],
            ],
        ]);

    $response->assertOk();

    $this->assertDatabaseHas('custom_field_definitions', ['id' => $field1->id, 'order' => 2]);
    $this->assertDatabaseHas('custom_field_definitions', ['id' => $field2->id, 'order' => 0]);
    $this->assertDatabaseHas('custom_field_definitions', ['id' => $field3->id, 'order' => 1]);
});

it('updates custom field values', function () {
    $field = CustomFieldDefinition::factory()->forWorkspace($this->workspace)->type('text')->create();

    $response = $this->actingAs($this->owner)
        ->putJson("/workspaces/{$this->workspace->id}/custom-field-values", [
            'customizable_type' => Workspace::class,
            'customizable_id' => $this->workspace->id,
            'values' => [
                ['field_id' => $field->id, 'value' => 'Test Value'],
            ],
        ]);

    $response->assertOk();

    $this->assertDatabaseHas('custom_field_values', [
        'custom_field_definition_id' => $field->id,
        'customizable_type' => Workspace::class,
        'customizable_id' => $this->workspace->id,
    ]);
});

it('validates select field values against options', function () {
    $field = CustomFieldDefinition::factory()->forWorkspace($this->workspace)->type('select')->create([
        'options' => ['Option A', 'Option B'],
    ]);

    $response = $this->actingAs($this->owner)
        ->putJson("/workspaces/{$this->workspace->id}/custom-field-values", [
            'customizable_type' => Workspace::class,
            'customizable_id' => $this->workspace->id,
            'values' => [
                ['field_id' => $field->id, 'value' => 'Invalid Option'],
            ],
        ]);

    $response->assertUnprocessable();
});

it('validates required fields', function () {
    $field = CustomFieldDefinition::factory()->forWorkspace($this->workspace)->required()->create();

    $response = $this->actingAs($this->owner)
        ->putJson("/workspaces/{$this->workspace->id}/custom-field-values", [
            'customizable_type' => Workspace::class,
            'customizable_id' => $this->workspace->id,
            'values' => [
                ['field_id' => $field->id, 'value' => ''],
            ],
        ]);

    $response->assertUnprocessable();
});

it('casts values to correct types', function () {
    $numberField = CustomFieldDefinition::factory()->forWorkspace($this->workspace)->type('number')->create();
    $boolField = CustomFieldDefinition::factory()->forWorkspace($this->workspace)->type('boolean')->create();

    $response = $this->actingAs($this->owner)
        ->putJson("/workspaces/{$this->workspace->id}/custom-field-values", [
            'customizable_type' => Workspace::class,
            'customizable_id' => $this->workspace->id,
            'values' => [
                ['field_id' => $numberField->id, 'value' => '42.5'],
                ['field_id' => $boolField->id, 'value' => true],
            ],
        ]);

    $response->assertOk();

    $numberValue = CustomFieldValue::where('custom_field_definition_id', $numberField->id)->first();
    expect($numberValue->value)->toBe(42.5);

    $boolValue = CustomFieldValue::where('custom_field_definition_id', $boolField->id)->first();
    expect($boolValue->value)->toBeTrue();
});

it('gets custom field values', function () {
    $field = CustomFieldDefinition::factory()->type('text')->forWorkspace($this->workspace)->create([
        'key' => 'project_code',
    ]);
    CustomFieldValue::factory()->create([
        'custom_field_definition_id' => $field->id,
        'customizable_type' => Workspace::class,
        'customizable_id' => $this->workspace->id,
        'value' => 'PROJ-123',
    ]);

    $response = $this->actingAs($this->owner)
        ->getJson("/workspaces/{$this->workspace->id}/custom-field-values?customizable_type=".urlencode(Workspace::class)."&customizable_id={$this->workspace->id}");

    $response->assertOk()
        ->assertJsonPath('data.project_code', 'PROJ-123');
});

it('prevents non-member from accessing custom fields', function () {
    $nonMember = User::factory()->create();

    $response = $this->actingAs($nonMember)
        ->getJson("/workspaces/{$this->workspace->id}/custom-fields");

    $response->assertForbidden();
});

it('prevents accessing field from different workspace', function () {
    $otherWorkspace = Workspace::factory()->create();
    $field = CustomFieldDefinition::factory()->forWorkspace($otherWorkspace)->create();

    $response = $this->actingAs($this->owner)
        ->putJson("/workspaces/{$this->workspace->id}/custom-fields/{$field->id}", [
            'name' => 'Hacked',
        ]);

    $response->assertNotFound();
});
