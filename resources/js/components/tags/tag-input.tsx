import { Button } from '@/components/ui/button';
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
import { router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { TagColorPicker } from './tag-color-picker';

interface TagInputProps {
    workspaceId: number;
    availableTags?: Array<{
        id: number;
        name: string;
        color: string;
        slug: string;
    }>;
    onTagCreated?: () => void;
}

export function TagInput({
    workspaceId,
    availableTags = [],
    onTagCreated,
}: TagInputProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [color, setColor] = useState('#3b82f6');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        router.post(
            `/workspaces/${workspaceId}/tags`,
            {
                name,
                color,
                description,
            },
            {
                onSuccess: () => {
                    setOpen(false);
                    setName('');
                    setColor('#3b82f6');
                    setDescription('');
                    onTagCreated?.();
                },
                onFinish: () => setLoading(false),
            },
        );
    };

    const handleAttachExisting = (tagId: number) => {
        router.post(
            `/workspaces/${workspaceId}/tags/attach`,
            { tag_id: tagId },
            {
                onSuccess: () => onTagCreated?.(),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus className="mr-1 h-4 w-4" />
                    Add Tag
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Tag</DialogTitle>
                    <DialogDescription>
                        Create a new tag or select from existing ones.
                    </DialogDescription>
                </DialogHeader>

                {availableTags.length > 0 && (
                    <div className="space-y-2">
                        <Label>Existing Tags</Label>
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map((tag) => (
                                <button
                                    key={tag.id}
                                    onClick={() => handleAttachExisting(tag.id)}
                                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-80"
                                    style={{
                                        backgroundColor: `${tag.color}20`,
                                        color: tag.color,
                                        border: `1px solid ${tag.color}40`,
                                    }}
                                    type="button"
                                >
                                    {tag.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">New Tag Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Urgent, Development, Marketing"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Color</Label>
                        <TagColorPicker value={color} onChange={setColor} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">
                            Description (optional)
                        </Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of this tag"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={loading || !name.trim()}
                        >
                            {loading ? 'Creating...' : 'Create Tag'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
