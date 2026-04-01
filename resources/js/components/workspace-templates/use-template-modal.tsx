import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
import { router } from '@inertiajs/react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface UseTemplateModalProps {
    template: {
        id: number;
        name: string;
    } | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function UseTemplateModal({
    template,
    open,
    onOpenChange,
    onSuccess,
}: UseTemplateModalProps) {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!template) return;

        setLoading(true);
        setError('');

        router.post(
            `/workspace-templates/${template.id}/use`,
            {
                name,
                slug,
            },
            {
                onSuccess: () => {
                    onOpenChange(false);
                    setName('');
                    setSlug('');
                    onSuccess?.();
                },
                onError: (errors) => {
                    setError(Object.values(errors).flat().join(', '));
                },
                onFinish: () => setLoading(false),
            },
        );
    };

    const generateSlug = (value: string) => {
        return value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleNameChange = (value: string) => {
        setName(value);
        if (!slug || slug === generateSlug(name)) {
            setSlug(generateSlug(value));
        }
    };

    if (!template) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Use Template: {template.name}</DialogTitle>
                    <DialogDescription>
                        Create a new workspace based on this template.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name">Workspace Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="My New Workspace"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug">Workspace URL</Label>
                        <div className="flex items-center gap-2">
                            <span className="text-sm whitespace-nowrap text-muted-foreground">
                                {window.location.origin}/
                            </span>
                            <Input
                                id="slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="my-workspace"
                                required
                                pattern="[a-z0-9-]+"
                                title="Only lowercase letters, numbers, and hyphens"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Use only lowercase letters, numbers, and hyphens.
                        </p>
                    </div>

                    <Alert>
                        <AlertDescription>
                            This will create a new workspace with settings,
                            custom fields, and webhook structure from the
                            template.
                        </AlertDescription>
                    </Alert>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !name.trim() || !slug.trim()}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Workspace'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
