import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { FieldTypeIcon } from './field-type-icon';

interface Field {
    id: number;
    name: string;
    key: string;
    type: string;
    required: boolean;
    default_value: string | null;
    options: string[] | null;
    current_value?: unknown;
}

interface FieldValueFormProps {
    workspaceId: number;
    fields: Field[];
    customizableType: string;
    customizableId: number;
}

export function FieldValueForm({
    workspaceId,
    fields,
    customizableType,
    customizableId,
}: FieldValueFormProps) {
    const [values, setValues] = useState<Record<number, unknown>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const initialValues: Record<number, unknown> = {};
        fields.forEach((field) => {
            initialValues[field.id] =
                field.current_value ?? field.default_value ?? '';
        });
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValues(initialValues);
    }, [fields]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const formattedValues = Object.entries(values).map(
            ([fieldId, value]) => ({
                field_id: parseInt(fieldId),
                value: value as string | number | boolean | null,
            }),
        );

        router.put(
            `/workspaces/${workspaceId}/custom-field-values`,
            {
                customizable_type: customizableType,
                customizable_id: customizableId,
                values: formattedValues,
            },
            {
                onFinish: () => setSaving(false),
            },
        );
    };

    const renderFieldInput = (field: Field) => {
        const value = values[field.id] ?? '';

        switch (field.type) {
            case 'text':
                return (
                    <Input
                        value={value as string}
                        onChange={(e) =>
                            setValues({ ...values, [field.id]: e.target.value })
                        }
                        required={field.required}
                    />
                );

            case 'textarea':
                return (
                    <Textarea
                        value={value as string}
                        onChange={(e) =>
                            setValues({ ...values, [field.id]: e.target.value })
                        }
                        required={field.required}
                        rows={3}
                    />
                );

            case 'number':
                return (
                    <Input
                        type="number"
                        value={value as number}
                        onChange={(e) =>
                            setValues({
                                ...values,
                                [field.id]: parseFloat(e.target.value),
                            })
                        }
                        required={field.required}
                    />
                );

            case 'date':
                return (
                    <Input
                        type="date"
                        value={value as string}
                        onChange={(e) =>
                            setValues({ ...values, [field.id]: e.target.value })
                        }
                        required={field.required}
                    />
                );

            case 'boolean':
                return (
                    <Checkbox
                        checked={value as boolean}
                        onCheckedChange={(checked) =>
                            setValues({ ...values, [field.id]: checked })
                        }
                    />
                );

            case 'select':
                return (
                    <Select
                        value={value as string}
                        onValueChange={(v) =>
                            setValues({ ...values, [field.id]: v })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );

            case 'url':
                return (
                    <Input
                        type="url"
                        value={value as string}
                        onChange={(e) =>
                            setValues({ ...values, [field.id]: e.target.value })
                        }
                        required={field.required}
                        placeholder="https://example.com"
                    />
                );

            default:
                return (
                    <Input
                        value={value as string}
                        onChange={(e) =>
                            setValues({ ...values, [field.id]: e.target.value })
                        }
                    />
                );
        }
    };

    if (fields.length === 0) {
        return null;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
                <div key={field.id} className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <FieldTypeIcon type={field.type} className="h-4 w-4" />
                        {field.name}
                        {field.required && (
                            <span className="text-red-500">*</span>
                        )}
                    </Label>
                    {renderFieldInput(field)}
                </div>
            ))}

            <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Values'}
            </Button>
        </form>
    );
}
