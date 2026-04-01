import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
import { Loader2, Save } from 'lucide-react';
import { useState } from 'react';

const CATEGORIES = [
    { value: 'general', label: 'General' },
    { value: 'development', label: 'Development' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'support', label: 'Support' },
    { value: 'design', label: 'Design' },
    { value: 'operations', label: 'Operations' },
];

const ICONS = [
    { value: 'building', label: 'Building' },
    { value: 'code', label: 'Code' },
    { value: 'rocket', label: 'Rocket' },
    { value: 'briefcase', label: 'Briefcase' },
    { value: 'palette', label: 'Palette' },
    { value: 'headphones', label: 'Headphones' },
    { value: 'chart-bar', label: 'Chart Bar' },
    { value: 'users', label: 'Users' },
    { value: 'star', label: 'Star' },
    { value: 'zap', label: 'Zap' },
];

interface SaveTemplateModalProps {
    workspaceId: number;
    workspaceName: string;
    onSuccess?: () => void;
}

export function SaveTemplateModal({
    workspaceId,
    workspaceName,
    onSuccess,
}: SaveTemplateModalProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(`${workspaceName} Template`);
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('building');
    const [category, setCategory] = useState('general');
    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        router.post(
            '/workspace-templates',
            {
                workspace_id: workspaceId,
                name,
                description,
                icon,
                category,
                is_public: isPublic,
            },
            {
                onSuccess: () => {
                    setOpen(false);
                    setName(`${workspaceName} Template`);
                    setDescription('');
                    setIcon('building');
                    setCategory('general');
                    setIsPublic(false);
                    onSuccess?.();
                },
                onFinish: () => setLoading(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Save className="mr-2 h-4 w-4" />
                    Save as Template
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Save as Template</DialogTitle>
                    <DialogDescription>
                        Save this workspace configuration as a reusable
                        template.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Template Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Development Team Setup"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what this template includes..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Icon</Label>
                            <Select value={icon} onValueChange={setIcon}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ICONS.map((i) => (
                                        <SelectItem
                                            key={i.value}
                                            value={i.value}
                                        >
                                            {i.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={category}
                                onValueChange={setCategory}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((c) => (
                                        <SelectItem
                                            key={c.value}
                                            value={c.value}
                                        >
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="public"
                            checked={isPublic}
                            onCheckedChange={(checked) =>
                                setIsPublic(checked as boolean)
                            }
                        />
                        <Label htmlFor="public" className="font-normal">
                            Make this template public (visible to all users)
                        </Label>
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={loading || !name.trim()}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Template'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
