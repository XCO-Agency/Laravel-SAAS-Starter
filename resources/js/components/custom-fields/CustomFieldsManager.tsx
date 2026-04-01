import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { router } from '@inertiajs/react';
import {
    AlignLeft,
    Calendar,
    FileText,
    GripVertical,
    Hash,
    Link,
    List,
    Plus,
    ToggleLeft,
    Trash2,
    Type,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface CustomField {
    id: number;
    name: string;
    field_type: string;
    options: string[] | null;
    is_required: boolean;
    sort_order: number;
}

interface CustomFieldsManagerProps {
    workspaceId: number;
    fields: CustomField[];
    isAdmin: boolean;
}

const FIELD_TYPES = [
    { value: 'text', label: 'Text', icon: Type },
    { value: 'textarea', label: 'Long Text', icon: AlignLeft },
    { value: 'number', label: 'Number', icon: Hash },
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'boolean', label: 'Yes/No', icon: ToggleLeft },
    { value: 'select', label: 'Dropdown', icon: List },
    { value: 'url', label: 'URL', icon: Link },
];

export function CustomFieldsManager({
    workspaceId,
    fields: initialFields,
    isAdmin,
}: CustomFieldsManagerProps) {
    const [fields] = useState<CustomField[]>(initialFields);
    const [isCreating, setIsCreating] = useState(false);
    const [newField, setNewField] = useState({
        name: '',
        field_type: 'text',
        options: [] as string[],
        is_required: false,
    });
    const [newOption, setNewOption] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newField.name.trim()) return;

        setIsLoading(true);
        const payload = {
            ...newField,
            options: newField.field_type === 'select' ? newField.options : null,
        };

        router.post(`/workspaces/${workspaceId}/custom-fields`, payload, {
            preserveScroll: true,
            onSuccess: () => {
                setNewField({
                    name: '',
                    field_type: 'text',
                    options: [],
                    is_required: false,
                });
                setIsCreating(false);
                router.reload({ only: ['customFields'] });
            },
            onFinish: () => setIsLoading(false),
        });
    };

    const handleDelete = (fieldId: number) => {
        setDeletingId(fieldId);
        router.delete(`/custom-fields/${fieldId}`, {
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        });
    };

    const addOption = () => {
        if (newOption.trim() && !newField.options.includes(newOption.trim())) {
            setNewField({
                ...newField,
                options: [...newField.options, newOption.trim()],
            });
            setNewOption('');
        }
    };

    const removeOption = (option: string) => {
        setNewField({
            ...newField,
            options: newField.options.filter((o) => o !== option),
        });
    };

    const getFieldIcon = (type: string) => {
        const fieldType = FIELD_TYPES.find((f) => f.value === type);
        const Icon = fieldType?.icon || FileText;
        return <Icon className="h-4 w-4" />;
    };

    return (
        <section className="border-l-4 border-l-cyan-500 bg-white dark:bg-slate-950">
            {/* Header - Editorial Style */}
            <div className="flex items-start justify-between border-b border-slate-200 p-6 dark:border-slate-800">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <FileText
                            className="h-5 w-5 text-cyan-500"
                            strokeWidth={2.5}
                        />
                        <h2 className="font-mono text-lg font-bold tracking-tight uppercase">
                            Custom Fields
                        </h2>
                    </div>
                    <p className="font-mono text-sm text-slate-500">
                        Define additional data fields for your workspace
                    </p>
                </div>
                {isAdmin && !isCreating && (
                    <Button
                        onClick={() => setIsCreating(true)}
                        variant="outline"
                        size="sm"
                        className="border-2 border-slate-900 font-mono text-xs tracking-wide uppercase hover:bg-slate-900 hover:text-white"
                    >
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        New Field
                    </Button>
                )}
            </div>

            {/* Create Form */}
            {isCreating && (
                <form
                    onSubmit={handleCreate}
                    className="border-b border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50"
                >
                    <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label
                                    htmlFor="field-name"
                                    className="font-mono text-xs tracking-wide text-slate-500 uppercase"
                                >
                                    Field Name
                                </Label>
                                <Input
                                    id="field-name"
                                    value={newField.name}
                                    onChange={(e) =>
                                        setNewField({
                                            ...newField,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., Project Code, Priority"
                                    className="mt-1.5 border-2 border-slate-200 font-mono text-sm focus:border-cyan-500 focus:ring-0 dark:border-slate-700"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <Label className="font-mono text-xs tracking-wide text-slate-500 uppercase">
                                    Field Type
                                </Label>
                                <Select
                                    value={newField.field_type}
                                    onValueChange={(value) =>
                                        setNewField({
                                            ...newField,
                                            field_type: value,
                                            options: [],
                                        })
                                    }
                                >
                                    <SelectTrigger className="mt-1.5 border-2 border-slate-200 font-mono text-sm focus:border-cyan-500 focus:ring-0 dark:border-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FIELD_TYPES.map((type) => {
                                            const Icon = type.icon;
                                            return (
                                                <SelectItem
                                                    key={type.value}
                                                    value={type.value}
                                                    className="font-mono text-sm"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Icon className="h-4 w-4" />
                                                        {type.label}
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Options for Select Fields */}
                        {newField.field_type === 'select' && (
                            <div className="border-l-2 border-cyan-300 pl-4">
                                <Label className="font-mono text-xs tracking-wide text-slate-500 uppercase">
                                    Dropdown Options
                                </Label>
                                <div className="mt-2 flex gap-2">
                                    <Input
                                        value={newOption}
                                        onChange={(e) =>
                                            setNewOption(e.target.value)
                                        }
                                        placeholder="Add an option..."
                                        className="border-2 border-slate-200 font-mono text-sm focus:border-cyan-500 focus:ring-0 dark:border-slate-700"
                                        onKeyDown={(e) =>
                                            e.key === 'Enter' &&
                                            (e.preventDefault(), addOption())
                                        }
                                    />
                                    <Button
                                        type="button"
                                        onClick={addOption}
                                        variant="outline"
                                        className="border-2 border-slate-900 font-mono text-xs uppercase"
                                    >
                                        Add
                                    </Button>
                                </div>
                                {newField.options.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {newField.options.map((option) => (
                                            <span
                                                key={option}
                                                className="inline-flex items-center gap-1 bg-cyan-100 px-2 py-1 font-mono text-xs text-cyan-900 dark:bg-cyan-900 dark:text-cyan-100"
                                            >
                                                {option}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeOption(option)
                                                    }
                                                    className="hover:text-cyan-600"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Required Toggle */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="is-required"
                                checked={newField.is_required}
                                onChange={(e) =>
                                    setNewField({
                                        ...newField,
                                        is_required: e.target.checked,
                                    })
                                }
                                className="h-4 w-4 rounded border-2 border-slate-300 text-cyan-500 focus:ring-0"
                            />
                            <Label
                                htmlFor="is-required"
                                className="font-mono text-sm"
                            >
                                Required field
                            </Label>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsCreating(false)}
                                className="font-mono text-xs uppercase"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading || !newField.name.trim()}
                                className="bg-cyan-500 font-mono text-xs tracking-wide uppercase hover:bg-cyan-600"
                            >
                                {isLoading && <Spinner className="mr-2" />}
                                Create Field
                            </Button>
                        </div>
                    </div>
                </form>
            )}

            {/* Fields List - Editorial Style */}
            <div className="divide-y divide-slate-100">
                {fields.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center border-2 border-dashed border-slate-300">
                            <FileText className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="font-mono text-sm text-slate-500">
                            No custom fields yet
                        </p>
                        <p className="mt-1 font-mono text-xs text-slate-400">
                            Add fields to track additional workspace data
                        </p>
                    </div>
                ) : (
                    fields.map((field) => (
                        <div
                            key={field.id}
                            className="group flex items-center gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
                        >
                            <div className="text-slate-300">
                                <GripVertical className="h-5 w-5" />
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center border-2 border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800">
                                {getFieldIcon(field.field_type)}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm font-medium">
                                        {field.name}
                                    </span>
                                    {field.is_required && (
                                        <span className="text-xs text-rose-500">
                                            *
                                        </span>
                                    )}
                                </div>
                                <div className="mt-0.5 flex items-center gap-2 font-mono text-xs text-slate-500">
                                    <span className="uppercase">
                                        {field.field_type}
                                    </span>
                                    {field.options &&
                                        field.options.length > 0 && (
                                            <>
                                                <span>·</span>
                                                <span>
                                                    {field.options.length}{' '}
                                                    options
                                                </span>
                                            </>
                                        )}
                                </div>
                            </div>

                            {isAdmin && (
                                <button
                                    onClick={() => handleDelete(field.id)}
                                    disabled={deletingId === field.id}
                                    className="text-slate-400 opacity-0 transition-all group-hover:opacity-100 hover:text-rose-500"
                                    title="Delete field"
                                >
                                    {deletingId === field.id ? (
                                        <Spinner className="h-4 w-4" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
