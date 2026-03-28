import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FieldTypeIcon, getFieldTypeLabel } from './field-type-icon';
import { FieldBuilder } from './field-builder';
import { router } from '@inertiajs/react';
import { GripVertical, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface Field {
  id: number;
  name: string;
  key: string;
  type: string;
  required: boolean;
  default_value: string | null;
  order: number;
}

interface FieldListProps {
  workspaceId: number;
  fields: Field[];
  loading?: boolean;
  canManage?: boolean;
}

export function FieldList({ workspaceId, fields, loading, canManage = true }: FieldListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = (fieldId: number) => {
    if (!confirm('Are you sure you want to delete this field? All values will be lost.')) {
      return;
    }
    setDeletingId(fieldId);
    router.delete(`/workspaces/${workspaceId}/custom-fields/${fieldId}`, {
      preserveScroll: true,
      onFinish: () => setDeletingId(null),
    });
  };

  const handleReorder = (fieldId: number, direction: 'up' | 'down') => {
    const currentIndex = fields.findIndex((f) => f.id === fieldId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const newFields = [...fields];
    const temp = newFields[currentIndex];
    newFields[currentIndex] = newFields[newIndex];
    newFields[newIndex] = temp;

    router.post(
      `/workspaces/${workspaceId}/custom-fields/reorder`,
      {
        fields: newFields.map((f, i) => ({ id: f.id, order: i })),
      },
      { preserveScroll: true }
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custom Fields</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Custom Fields</CardTitle>
        {canManage && <FieldBuilder workspaceId={workspaceId} />}
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No custom fields defined.</p>
            {canManage && (
              <p className="text-sm mt-1">
                Add custom fields to store additional workspace information.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {fields
              .sort((a, b) => a.order - b.order)
              .map((field, index) => (
                <div
                  key={field.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg ${
                    deletingId === field.id ? 'opacity-50' : ''
                  }`}
                >
                  {canManage && (
                    <div className="flex flex-col">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleReorder(field.id, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleReorder(field.id, 'down')}
                        disabled={index === fields.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <div className="p-2 bg-muted rounded">
                    <FieldTypeIcon type={field.type} className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{field.name}</span>
                      {field.required && (
                        <span className="text-xs text-red-500">*</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{getFieldTypeLabel(field.type)}</span>
                      <span>·</span>
                      <code className="text-xs">{field.key}</code>
                    </div>
                  </div>

                  {canManage && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(field.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
