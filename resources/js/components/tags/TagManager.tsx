import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Plus, X, Hash, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

interface Tag {
  id: number;
  name: string;
  slug: string;
  color: string;
  description?: string;
}

interface TagManagerProps {
  workspaceId: number;
  tags: Tag[];
  isAdmin: boolean;
}

const PRESET_COLORS = [
  '#e11d48', // rose
  '#ea580c', // orange
  '#ca8a04', // yellow
  '#16a34a', // green
  '#0891b2', // cyan
  '#2563eb', // blue
  '#7c3aed', // violet
  '#db2777', // pink
  '#475569', // slate
];

export function TagManager({ workspaceId, tags: initialTags, isAdmin }: TagManagerProps) {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [isCreating, setIsCreating] = useState(false);
  const [newTag, setNewTag] = useState({ name: '', color: PRESET_COLORS[0], description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.name.trim()) return;

    setIsLoading(true);
    router.post(`/workspaces/${workspaceId}/tags`, newTag, {
      preserveScroll: true,
      onSuccess: () => {
        setNewTag({ name: '', color: PRESET_COLORS[0], description: '' });
        setIsCreating(false);
        router.reload({ only: ['tags'] });
      },
      onFinish: () => setIsLoading(false),
    });
  };

  const handleDelete = (tagId: number) => {
    setDeletingId(tagId);
    router.delete(`/tags/${tagId}`, {
      preserveScroll: true,
      onFinish: () => setDeletingId(null),
    });
  };

  return (
    <section className="border-l-4 border-l-rose-500 bg-white dark:bg-slate-950">
      {/* Header - Editorial Style */}
      <div className="flex items-start justify-between border-b border-slate-200 p-6 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Hash className="h-5 w-5 text-rose-500" strokeWidth={2.5} />
            <h2 className="font-mono text-lg font-bold uppercase tracking-tight">
              Workspace Tags
            </h2>
          </div>
          <p className="font-mono text-sm text-slate-500">
            Categorize and organize with color-coded labels
          </p>
        </div>
        {isAdmin && !isCreating && (
          <Button
            onClick={() => setIsCreating(true)}
            variant="outline"
            size="sm"
            className="border-2 border-slate-900 font-mono text-xs uppercase tracking-wide hover:bg-slate-900 hover:text-white"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Tag
          </Button>
        )}
      </div>

      {/* Create Form - Asymmetric Layout */}
      {isCreating && (
        <form onSubmit={handleCreate} className="border-b border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="grid gap-6 md:grid-cols-[1fr,auto] md:items-end">
            <div className="space-y-4">
              <div>
                <Label htmlFor="tag-name" className="font-mono text-xs uppercase tracking-wide text-slate-500">
                  Tag Name
                </Label>
                <Input
                  id="tag-name"
                  value={newTag.name}
                  onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                  placeholder="e.g., Urgent, Review, Archive"
                  className="mt-1.5 border-2 border-slate-200 font-mono text-sm focus:border-rose-500 focus:ring-0 dark:border-slate-700"
                  autoFocus
                />
              </div>

              {/* Color Grid - Bold Visual Selection */}
              <div>
                <Label className="font-mono text-xs uppercase tracking-wide text-slate-500">
                  Color
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewTag({ ...newTag, color })}
                      className={`h-10 w-10 rounded-none border-2 transition-all ${
                        newTag.color === color
                          ? 'border-slate-900 scale-110 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                          : 'border-transparent hover:border-slate-300'
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCreating(false)}
                className="font-mono text-xs uppercase"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !newTag.name.trim()}
                size="sm"
                className="bg-rose-500 font-mono text-xs uppercase tracking-wide hover:bg-rose-600"
              >
                {isLoading && <Spinner className="mr-2" />}
                Create
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Tags Display - Editorial Grid */}
      <div className="p-6">
        {tags.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center border-2 border-dashed border-slate-300">
              <Hash className="h-6 w-6 text-slate-400" />
            </div>
            <p className="font-mono text-sm text-slate-500">No tags yet</p>
            <p className="mt-1 font-mono text-xs text-slate-400">
              Create tags to organize your workspace
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="group relative flex items-center gap-2 border-2 border-slate-200 bg-white px-3 py-2 transition-all hover:border-slate-900 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:border-slate-700 dark:bg-slate-900"
              >
                <span
                  className="h-3 w-3 shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="font-mono text-sm font-medium">{tag.name}</span>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(tag.id)}
                    disabled={deletingId === tag.id}
                    className="ml-1 text-slate-400 opacity-0 transition-all hover:text-rose-500 group-hover:opacity-100"
                    title="Delete tag"
                  >
                    {deletingId === tag.id ? (
                      <Spinner className="h-3.5 w-3.5" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
