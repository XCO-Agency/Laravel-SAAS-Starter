import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { KeyRound, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface AvailablePermission {
    id: string;
    label: string;
    group: string;
}

interface PermissionPreset {
    id: number;
    name: string;
    description: string | null;
    permissions: string[];
}

interface PermissionPresetsProps {
    presets: PermissionPreset[];
    availablePermissions: AvailablePermission[];
}

export default function PermissionPresets({
    presets,
    availablePermissions,
}: PermissionPresetsProps) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editPreset, setEditPreset] = useState<PermissionPreset | null>(null);

    const {
        data: createData,
        setData: setCreateData,
        processing: createProcessing,
        errors: createErrors,
        reset: resetCreate,
    } = useForm({
        name: '',
        description: '',
        permissions: [] as string[],
    });

    const {
        data: editData,
        setData: setEditData,
        processing: editProcessing,
        errors: editErrors,
    } = useForm({
        name: '',
        description: '',
        permissions: [] as string[],
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/admin/permission-presets', createData, {
            preserveScroll: true,
            onSuccess: () => {
                setCreateOpen(false);
                resetCreate();
            },
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editPreset) return;
        router.put(`/admin/permission-presets/${editPreset.id}`, editData, {
            preserveScroll: true,
            onSuccess: () => {
                setEditPreset(null);
            },
        });
    };

    const handleDelete = (preset: PermissionPreset) => {
        if (!confirm(`Delete preset "${preset.name}"?`)) return;
        router.delete(`/admin/permission-presets/${preset.id}`, {
            preserveScroll: true,
        });
    };

    const openEdit = (preset: PermissionPreset) => {
        setEditData({
            name: preset.name,
            description: preset.description || '',
            permissions: [...preset.permissions],
        });
        setEditPreset(preset);
    };

    // Group permissions by group name
    const permissionGroups = availablePermissions.reduce(
        (acc, perm) => {
            if (!acc[perm.group]) acc[perm.group] = [];
            acc[perm.group].push(perm);
            return acc;
        },
        {} as Record<string, AvailablePermission[]>,
    );

    const permissionLabel = (id: string) =>
        availablePermissions.find((p) => p.id === id)?.label ?? id;

    const renderPermissionCheckboxes = (
        selectedPermissions: string[],
        onChange: (perms: string[]) => void,
    ) => (
        <div className="space-y-4">
            {Object.entries(permissionGroups).map(([group, perms]) => (
                <div key={group} className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {group}
                    </p>
                    <div className="space-y-2">
                        {perms.map((perm) => (
                            <div
                                key={perm.id}
                                className="flex items-start gap-3 rounded-md border p-3"
                            >
                                <Checkbox
                                    id={`perm-${perm.id}`}
                                    checked={selectedPermissions.includes(perm.id)}
                                    onCheckedChange={(checked) => {
                                        const updated = checked
                                            ? [...selectedPermissions, perm.id]
                                            : selectedPermissions.filter(
                                                  (p) => p !== perm.id,
                                              );
                                        onChange(updated);
                                    }}
                                />
                                <Label
                                    htmlFor={`perm-${perm.id}`}
                                    className="cursor-pointer text-sm font-medium leading-none"
                                >
                                    {perm.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <AdminLayout>
            <Head title="Permission Presets" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl border border-sidebar-border/70 p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <KeyRound className="h-6 w-6" />
                            Permission Presets
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Create reusable permission templates for common team
                            member responsibilities.
                        </p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Preset
                    </Button>
                </div>

                {presets.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <KeyRound className="mb-4 h-12 w-12 text-muted-foreground/50" />
                            <p className="text-lg font-medium">
                                No presets yet
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Create your first permission preset to simplify
                                team member setup.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {presets.map((preset) => (
                            <Card key={preset.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-base">
                                                {preset.name}
                                            </CardTitle>
                                            {preset.description && (
                                                <CardDescription className="mt-1">
                                                    {preset.description}
                                                </CardDescription>
                                            )}
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() =>
                                                    openEdit(preset)
                                                }
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() =>
                                                    handleDelete(preset)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-1.5">
                                        {preset.permissions.map((perm) => (
                                            <Badge
                                                key={perm}
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                {permissionLabel(perm)}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Preset Dialog */}
            <Dialog
                open={createOpen}
                onOpenChange={(open) => {
                    setCreateOpen(open);
                    if (!open) resetCreate();
                }}
            >
                <DialogContent>
                    <form onSubmit={handleCreate}>
                        <DialogHeader>
                            <DialogTitle>Create Permission Preset</DialogTitle>
                            <DialogDescription>
                                Define a reusable set of permissions for team
                                members.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="create-name">Name</Label>
                                <Input
                                    id="create-name"
                                    value={createData.name}
                                    onChange={(e) =>
                                        setCreateData('name', e.target.value)
                                    }
                                    placeholder="e.g., Content Manager"
                                />
                                {createErrors.name && (
                                    <p className="text-sm text-destructive">
                                        {createErrors.name}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-desc">
                                    Description (optional)
                                </Label>
                                <Input
                                    id="create-desc"
                                    value={createData.description}
                                    onChange={(e) =>
                                        setCreateData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Brief description of this role"
                                />
                            </div>
                            {renderPermissionCheckboxes(
                                createData.permissions,
                                (perms) =>
                                    setCreateData('permissions', perms),
                            )}
                            {createErrors.permissions && (
                                <p className="text-sm text-destructive">
                                    {createErrors.permissions}
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCreateOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createProcessing}
                            >
                                Create Preset
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Preset Dialog */}
            <Dialog
                open={!!editPreset}
                onOpenChange={(open) => {
                    if (!open) setEditPreset(null);
                }}
            >
                <DialogContent>
                    <form onSubmit={handleUpdate}>
                        <DialogHeader>
                            <DialogTitle>Edit Permission Preset</DialogTitle>
                            <DialogDescription>
                                Update the preset&apos;s name, description, and
                                permissions.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editData.name}
                                    onChange={(e) =>
                                        setEditData('name', e.target.value)
                                    }
                                />
                                {editErrors.name && (
                                    <p className="text-sm text-destructive">
                                        {editErrors.name}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-desc">
                                    Description (optional)
                                </Label>
                                <Input
                                    id="edit-desc"
                                    value={editData.description}
                                    onChange={(e) =>
                                        setEditData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            {renderPermissionCheckboxes(
                                editData.permissions,
                                (perms) =>
                                    setEditData('permissions', perms),
                            )}
                            {editErrors.permissions && (
                                <p className="text-sm text-destructive">
                                    {editErrors.permissions}
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditPreset(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={editProcessing}
                            >
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
