import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { TagBadge } from './tag-badge';
import { TagInput } from './tag-input';

interface Tag {
    id: number;
    name: string;
    color: string;
    slug: string;
    description?: string;
}

interface TagListProps {
    workspaceId: number;
    tags: Tag[];
    availableTags?: Tag[];
    loading?: boolean;
    canManage?: boolean;
}

export function TagList({
    workspaceId,
    tags,
    availableTags = [],
    loading,
    canManage = true,
}: TagListProps) {
    const [removingId, setRemovingId] = useState<number | null>(null);

    const handleRemove = (tagId: number) => {
        setRemovingId(tagId);
        router.delete(`/workspaces/${workspaceId}/tags/${tagId}`, {
            preserveScroll: true,
            onFinish: () => setRemovingId(null),
        });
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-14 rounded-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Tags</CardTitle>
                {canManage && (
                    <TagInput
                        workspaceId={workspaceId}
                        availableTags={availableTags.filter(
                            (at) => !tags.find((t) => t.id === at.id),
                        )}
                    />
                )}
            </CardHeader>
            <CardContent>
                {tags.length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground">
                        <p>No tags assigned to this workspace.</p>
                        {canManage && (
                            <p className="mt-1 text-sm">
                                Add tags to organize and categorize this
                                workspace.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <TagBadge
                                key={tag.id}
                                name={tag.name}
                                color={tag.color}
                                onRemove={
                                    canManage
                                        ? () => handleRemove(tag.id)
                                        : undefined
                                }
                                className={
                                    removingId === tag.id ? 'opacity-50' : ''
                                }
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
