import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, LayoutGrid, Code, Megaphone, TrendingUp, Headphones, Folder, Kanban } from 'lucide-react';
import { UseTemplateModal } from '@/components/workspace-templates/use-template-modal';

interface Template {
  id: number;
  name: string;
  description: string | null;
  icon: string;
  category: string;
  is_public: boolean;
  usage_count: number;
  user: {
    name: string;
  };
}

interface Props {
  templates: Template[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
  categories: Record<string, string>;
  filters: {
    category: string | null;
    search: string | null;
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  general: 'bg-slate-500',
  development: 'bg-emerald-500',
  marketing: 'bg-amber-500',
  sales: 'bg-blue-500',
  support: 'bg-cyan-500',
  design: 'bg-pink-500',
  operations: 'bg-violet-500',
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  general: LayoutGrid,
  development: Code,
  marketing: Megaphone,
  sales: TrendingUp,
  support: Headphones,
  design: Folder,
  operations: Kanban,
};

export default function WorkspaceTemplatesIndex({ templates, meta, categories, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [category, setCategory] = useState(filters.category || '');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [useModalOpen, setUseModalOpen] = useState(false);

  const handleSearch = () => {
    router.get('/workspace-templates', {
      search: search || undefined,
      category: category || undefined,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleCategoryClick = (cat: string) => {
    const newCategory = category === cat ? '' : cat;
    setCategory(newCategory);
    router.get('/workspace-templates', {
      search: search || undefined,
      category: newCategory || undefined,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setUseModalOpen(true);
  };

  const handleDuplicate = (template: Template) => {
    router.post(`/workspace-templates/${template.id}/duplicate`, {});
  };

  return (
    <AppLayout>
      <Head title="Workspace Templates" />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Hero Header - Bold Editorial */}
        <header className="border-b-4 border-violet-500 bg-white dark:border-violet-600 dark:bg-slate-900">
          <div className="container mx-auto px-6 py-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-violet-500">
                  <span className="h-px w-8 bg-violet-500" />
                  Workspace Factory
                </div>
                <h1 className="font-mono text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                  Templates
                </h1>
                <p className="max-w-md font-mono text-sm text-slate-500">
                  Create new workspaces from pre-configured templates. 
                  Save time, maintain consistency.
                </p>
              </div>

              <Button
                onClick={() => router.visit('/workspace-templates/create')}
                className="border-2 border-slate-900 bg-violet-500 font-mono text-xs uppercase tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-slate-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </div>

            {/* Search & Filter Bar */}
            <div className="mt-8 flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="border-2 border-slate-200 pl-11 font-mono text-sm focus:border-violet-500 focus:ring-0 dark:border-slate-700"
                />
              </div>
              <Button
                onClick={handleSearch}
                variant="outline"
                className="border-2 border-slate-900 font-mono text-xs uppercase tracking-wide hover:bg-slate-900 hover:text-white"
              >
                Search
              </Button>
            </div>

            {/* Category Filters - Pill Style */}
            <div className="mt-6 flex flex-wrap gap-2">
              {Object.entries(categories).map(([key, label]) => {
                const isActive = category === key;
                const Icon = CATEGORY_ICONS[key] || LayoutGrid;
                return (
                  <button
                    key={key}
                    onClick={() => handleCategoryClick(key)}
                    className={`inline-flex items-center gap-2 border-2 px-4 py-2 font-mono text-xs uppercase tracking-wide transition-all ${
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white shadow-[3px_3px_0px_0px_rgba(124,58,237,1)]'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Templates Grid - Editorial Card Layout */}
        <main className="container mx-auto px-6 py-8">
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center border-2 border-dashed border-slate-300">
                <LayoutGrid className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="font-mono text-lg font-bold uppercase">No templates found</h3>
              <p className="mt-2 max-w-sm font-mono text-sm text-slate-500">
                Try adjusting your search or category filter, or create a new template from your current workspace.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wide text-slate-500">
                  {templates.length} template{templates.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => {
                  const Icon = CATEGORY_ICONS[template.category] || LayoutGrid;
                  const colorClass = CATEGORY_COLORS[template.category] || 'bg-slate-500';
                  
                  return (
                    <article
                      key={template.id}
                      className="group relative border-2 border-slate-200 bg-white transition-all hover:border-slate-900 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-slate-700 dark:bg-slate-900"
                    >
                      {/* Color Bar */}
                      <div className={`h-2 ${colorClass}`} />
                      
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center ${colorClass} text-white`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-mono text-sm font-bold">{template.name}</h3>
                              <p className="font-mono text-xs text-slate-500">
                                by {template.user.name}
                              </p>
                            </div>
                          </div>
                          {template.is_public && (
                            <span className="border border-slate-200 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-slate-500 dark:border-slate-700">
                              Public
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        {template.description && (
                          <p className="mt-4 line-clamp-2 font-mono text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            {template.description}
                          </p>
                        )}

                        {/* Footer */}
                        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                          <span className="font-mono text-xs text-slate-500">
                            Used {template.usage_count} time{template.usage_count !== 1 ? 's' : ''}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicate(template)}
                              className="font-mono text-xs uppercase hover:text-violet-500"
                            >
                              Copy
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUseTemplate(template)}
                              className="bg-slate-900 font-mono text-xs uppercase tracking-wide text-white hover:bg-slate-800"
                            >
                              Use
                            </Button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination */}
              {meta.last_page > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() =>
                        router.get('/workspace-templates', {
                          page,
                          search: search || undefined,
                          category: category || undefined,
                        }, {
                          preserveState: true,
                        })
                      }
                      className={`h-10 w-10 border-2 font-mono text-sm font-bold transition-all ${
                        page === meta.current_page
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <UseTemplateModal
        template={selectedTemplate}
        open={useModalOpen}
        onOpenChange={setUseModalOpen}
        onSuccess={() => {
          setSelectedTemplate(null);
        }}
      />
    </AppLayout>
  );
}
