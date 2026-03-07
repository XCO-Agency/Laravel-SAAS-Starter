<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PermissionPreset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PermissionPresetController extends Controller
{
    /**
     * Display the permission presets management page.
     */
    public function index(): Response
    {
        $presets = PermissionPreset::query()
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/permission-presets', [
            'presets' => $presets,
            'availablePermissions' => $this->availablePermissions(),
        ]);
    }

    /**
     * Store a new permission preset.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:permission_presets,name'],
            'description' => ['nullable', 'string', 'max:255'],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['string', Rule::in(PermissionPreset::AVAILABLE_PERMISSIONS)],
        ]);

        PermissionPreset::create($validated);

        return redirect()->back()->with('success', "Preset \"{$validated['name']}\" created.");
    }

    /**
     * Update an existing permission preset.
     */
    public function update(Request $request, PermissionPreset $permissionPreset): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('permission_presets', 'name')->ignore($permissionPreset->id)],
            'description' => ['nullable', 'string', 'max:255'],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['string', Rule::in(PermissionPreset::AVAILABLE_PERMISSIONS)],
        ]);

        $permissionPreset->update($validated);

        return redirect()->back()->with('success', "Preset \"{$validated['name']}\" updated.");
    }

    /**
     * Delete a permission preset.
     */
    public function destroy(PermissionPreset $permissionPreset): RedirectResponse
    {
        $name = $permissionPreset->name;
        $permissionPreset->delete();

        return redirect()->back()->with('success', "Preset \"{$name}\" deleted.");
    }

    /**
     * Return all available permissions with labels and groups.
     *
     * @return array<int, array{id: string, label: string, group: string}>
     */
    private function availablePermissions(): array
    {
        return [
            ['id' => 'manage_team', 'label' => 'Team Management', 'group' => 'Team Access'],
            ['id' => 'manage_billing', 'label' => 'Billing Management', 'group' => 'Billing Access'],
            ['id' => 'manage_webhooks', 'label' => 'Webhook Management', 'group' => 'Operations Access'],
            ['id' => 'view_activity_logs', 'label' => 'Activity Log Visibility', 'group' => 'Operations Access'],
        ];
    }
}
