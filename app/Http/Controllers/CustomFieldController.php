<?php

namespace App\Http\Controllers;

use App\Models\CustomFieldDefinition;
use App\Models\CustomFieldValue;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CustomFieldController extends Controller
{
    public function index(Request $request, Workspace $workspace)
    {
        if (! $request->user()->belongsToWorkspace($workspace)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $fields = $workspace->customFieldDefinitions()
            ->ordered()
            ->get();

        // Include values if a customizable type/id is provided
        if ($request->has('customizable_type') && $request->has('customizable_id')) {
            $values = CustomFieldValue::where('customizable_type', $request->input('customizable_type'))
                ->where('customizable_id', $request->input('customizable_id'))
                ->pluck('value', 'custom_field_definition_id');

            $fields->each(function ($field) use ($values) {
                $field->current_value = $values->get($field->id, $field->default_value);
            });
        }

        return response()->json([
            'data' => $fields,
        ]);
    }

    public function store(Request $request, Workspace $workspace)
    {
        if (! $request->user()->userIsAdmin($workspace)) {
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'type' => ['required', 'string', 'in:'.implode(',', array_keys(CustomFieldDefinition::getFieldTypes()))],
            'options' => ['nullable', 'array', 'required_if:type,select'],
            'options.*' => ['string', 'max:255'],
            'required' => ['boolean'],
            'default_value' => ['nullable', 'string', 'max:1000'],
        ]);

        // Generate unique key
        $key = Str::slug($validated['name'], '_');
        $originalKey = $key;
        $counter = 1;

        while (CustomFieldDefinition::where('workspace_id', $workspace->id)->where('key', $key)->exists()) {
            $key = $originalKey.'_'.$counter++;
        }

        // Get max order
        $maxOrder = $workspace->customFieldDefinitions()->max('order') ?? 0;

        $field = CustomFieldDefinition::create([
            'workspace_id' => $workspace->id,
            'name' => $validated['name'],
            'key' => $key,
            'type' => $validated['type'],
            'options' => $validated['type'] === 'select' ? ($validated['options'] ?? []) : null,
            'required' => $validated['required'] ?? false,
            'default_value' => $validated['default_value'] ?? null,
            'order' => $maxOrder + 1,
        ]);

        return response()->json([
            'message' => 'Custom field created successfully.',
            'data' => $field,
        ], 201);
    }

    public function update(Request $request, Workspace $workspace, CustomFieldDefinition $field)
    {
        if (! $request->user()->userIsAdmin($workspace)) {
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }

        if ($field->workspace_id !== $workspace->id) {
            return response()->json(['message' => 'Field not found.'], 404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'options' => ['nullable', 'array'],
            'options.*' => ['string', 'max:255'],
            'required' => ['boolean'],
            'default_value' => ['nullable', 'string', 'max:1000'],
        ]);

        $field->update([
            'name' => $validated['name'],
            'options' => $field->type === 'select' ? ($validated['options'] ?? []) : null,
            'required' => $validated['required'] ?? false,
            'default_value' => $validated['default_value'] ?? null,
        ]);

        return response()->json([
            'message' => 'Custom field updated successfully.',
            'data' => $field,
        ]);
    }

    public function destroy(Request $request, Workspace $workspace, CustomFieldDefinition $field)
    {
        if (! $request->user()->userIsAdmin($workspace)) {
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }

        if ($field->workspace_id !== $workspace->id) {
            return response()->json(['message' => 'Field not found.'], 404);
        }

        // Delete associated values first
        $field->values()->delete();

        // Delete the field
        $field->delete();

        return response()->json([
            'message' => 'Custom field deleted successfully.',
        ]);
    }

    public function reorder(Request $request, Workspace $workspace)
    {
        if (! $request->user()->userIsAdmin($workspace)) {
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }

        $validated = $request->validate([
            'fields' => ['required', 'array'],
            'fields.*.id' => ['required', 'exists:custom_field_definitions,id'],
            'fields.*.order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($validated['fields'] as $fieldData) {
            CustomFieldDefinition::where('id', $fieldData['id'])
                ->where('workspace_id', $workspace->id)
                ->update(['order' => $fieldData['order']]);
        }

        return response()->json([
            'message' => 'Fields reordered successfully.',
        ]);
    }

    public function updateValues(Request $request, Workspace $workspace)
    {
        if (! $request->user()->belongsToWorkspace($workspace)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'customizable_type' => ['required', 'string'],
            'customizable_id' => ['required', 'integer'],
            'values' => ['required', 'array'],
            'values.*.field_id' => ['required', 'exists:custom_field_definitions,id'],
            'values.*.value' => ['nullable'],
        ]);

        $customizableType = $validated['customizable_type'];
        $customizableId = $validated['customizable_id'];

        foreach ($validated['values'] as $valueData) {
            $field = CustomFieldDefinition::findOrFail($valueData['field_id']);

            // Verify field belongs to this workspace
            if ($field->workspace_id !== $workspace->id) {
                continue;
            }

            $value = $valueData['value'];

            // Validate value
            if (! $field->validateValue($value)) {
                return response()->json([
                    'message' => "Invalid value for field: {$field->name}",
                    'errors' => ["values.{$valueData['field_id']}" => ['Invalid value']],
                ], 422);
            }

            // Cast value to proper type
            $castedValue = $field->getCastedValue($value);

            CustomFieldValue::updateOrCreate(
                [
                    'custom_field_definition_id' => $field->id,
                    'customizable_type' => $customizableType,
                    'customizable_id' => $customizableId,
                ],
                ['value' => $castedValue]
            );
        }

        return response()->json([
            'message' => 'Custom field values updated successfully.',
        ]);
    }

    public function getValues(Request $request, Workspace $workspace)
    {
        if (! $request->user()->belongsToWorkspace($workspace)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'customizable_type' => ['required', 'string'],
            'customizable_id' => ['required', 'integer'],
        ]);

        $values = CustomFieldValue::with('definition')
            ->where('customizable_type', $validated['customizable_type'])
            ->where('customizable_id', $validated['customizable_id'])
            ->get()
            ->mapWithKeys(function ($value) {
                return [$value->definition->key => $value->getDisplayValue()];
            });

        return response()->json([
            'data' => $values,
        ]);
    }
}
