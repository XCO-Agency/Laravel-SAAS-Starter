import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X } from 'lucide-react';
import { FieldTypeIcon, getFieldTypeLabel } from './field-type-icon';
import { router } from '@inertiajs/react';

const FIELD_TYPES = ['text', 'textarea', 'number', 'date', 'boolean', 'select', 'url'];

interface FieldBuilderProps {
  workspaceId: number;
  onFieldCreated?: () => void;
}

export function FieldBuilder({ workspaceId, onFieldCreated }: FieldBuilderProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const [required, setRequired] = useState(false);
  const [defaultValue, setDefaultValue] = useState('');
  const [options, setOptions] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data: Record<string, unknown> = {
      name,
      type,
      required,
      default_value: defaultValue || null,
    };

    if (type === 'select') {
      data.options = options.filter((o) => o.trim() !== '');
    }

    router.post(`/workspaces/${workspaceId}/custom-fields`, data, {
      onSuccess: () => {
        setOpen(false);
        setName('');
        setType('text');
        setRequired(false);
        setDefaultValue('');
        setOptions(['']);
        onFieldCreated?.();
      },
      onFinish: () => setLoading(false),
    });
  };

  const addOption = () => setOptions([...options, '']);
  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Field
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Custom Field</DialogTitle>
          <DialogDescription>
            Add a custom field to store additional workspace information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Field Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Project Code, Priority, Due Date"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Field Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    <div className="flex items-center gap-2">
                      <FieldTypeIcon type={t} className="h-4 w-4" />
                      {getFieldTypeLabel(t)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === 'select' && (
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    {options.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                >
                  Add Option
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="default">Default Value (optional)</Label>
            <Input
              id="default"
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              placeholder="Default value for this field"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="required"
              checked={required}
              onCheckedChange={(checked) => setRequired(checked as boolean)}
            />
            <Label htmlFor="required" className="font-normal">
              Make this field required
            </Label>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? 'Creating...' : 'Create Field'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
