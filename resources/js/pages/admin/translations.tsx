import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Loader2, Plus, Save } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TranslationPair {
    base: string;
    target: string;
}

interface Props {
    locales: string[];
    currentLocale?: string;
    translations?: Record<string, TranslationPair>;
}

export default function Translations({ locales, currentLocale, translations = {} }: Props) {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingKey, setUpdatingKey] = useState<string | null>(null);

    // Filter translations based on search
    const filteredTranslations = Object.entries(translations).filter(([key, pair]) => {
        const query = searchQuery.toLowerCase();
        return key.toLowerCase().includes(query) ||
            pair.base.toLowerCase().includes(query) ||
            pair.target.toLowerCase().includes(query);
    });

    // Form for creating a new language
    const { data, setData, post, processing: creatingLocale, errors } = useForm({
        locale: '',
    });

    const handleCreateLocale = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/translations', {
            onSuccess: () => {
                toast({
                    title: 'Locale Created',
                    description: `Successfully created translation file for '${data.locale}'`,
                });
                setData('locale', '');
            },
        });
    };

    const updateTranslation = (key: string, value: string) => {
        setUpdatingKey(key);

        router.put(`/admin/translations/${currentLocale}`, {
            key,
            value,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast({
                    title: 'Translation Saved',
                    description: 'The translation string was updated successfully.',
                });
            },
            onFinish: () => {
                setUpdatingKey(null);
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Localization Management" />

            <div className="flex h-full flex-col md:flex-row">
                {/* Languages Sidebar */}
                <div className="w-full border-r md:w-64 shrink-0">
                    <div className="flex h-14 items-center justify-between border-b px-4">
                        <h2 className="font-semibold">Languages</h2>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8">
                                    <Plus className="size-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <form onSubmit={handleCreateLocale}>
                                    <DialogHeader>
                                        <DialogTitle>Add New Language</DialogTitle>
                                        <DialogDescription>
                                            Enter the 2-letter ISO locale code (e.g. 'de', 'it', 'pt-BR').
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="py-4">
                                        <Label htmlFor="locale">Locale Code</Label>
                                        <Input
                                            id="locale"
                                            value={data.locale}
                                            onChange={e => setData('locale', e.target.value)}
                                            placeholder="e.g. de"
                                            className="mt-2"
                                            maxLength={10}
                                        />
                                        {errors.locale && <p className="mt-1 text-sm text-destructive">{errors.locale}</p>}
                                    </div>

                                    <DialogFooter>
                                        <Button type="submit" disabled={creatingLocale || !data.locale}>
                                            {creatingLocale && <Loader2 className="mr-2 size-4 animate-spin" />}
                                            Create Language
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <nav className="p-2 space-y-1">
                        {locales.map(locale => (
                            <Link
                                key={locale}
                                href={`/admin/translations/${locale}`}
                                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${currentLocale === locale
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                            >
                                <Globe className="mr-2 size-4 opacity-70" />
                                <span className="uppercase">{locale}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {currentLocale ? (
                        <>
                            <div className="flex h-14 items-center gap-4 border-b px-6 shrink-0">
                                <h1 className="font-semibold">Editing: <span className="uppercase">{currentLocale}</span></h1>
                                <div className="ml-auto w-full max-w-sm">
                                    <Input
                                        type="search"
                                        placeholder="Search keys or translations..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="h-8 shadow-none"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto p-6">
                                <div className="rounded-md border bg-card">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[30%]">Key / Base Line (EN)</TableHead>
                                                <TableHead className="w-[70%]">Translation ({currentLocale.toUpperCase()})</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredTranslations.length > 0 ? (
                                                filteredTranslations.map(([key, pair]) => (
                                                    <TableRow key={key}>
                                                        <TableCell className="align-top">
                                                            <div className="font-medium text-xs break-all text-slate-500 mb-1">{key}</div>
                                                            <div className="text-sm">{pair.base || <span className="text-muted-foreground italic">No base translation</span>}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <TranslationEditor
                                                                translationKey={key}
                                                                initialValue={pair.target}
                                                                onSave={updateTranslation}
                                                                isSaving={updatingKey === key}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                                                        No translations found matching your search.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex h-full items-center justify-center p-6 text-center text-muted-foreground">
                            <div>
                                <Globe className="mx-auto size-12 opacity-20 mb-4" />
                                <h3 className="text-lg font-medium text-foreground mb-1">Select a Language</h3>
                                <p>Choose a language from the sidebar to start translating.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

// Sub-component for individual translation rows to manage local dirty state
function TranslationEditor({
    translationKey,
    initialValue,
    onSave,
    isSaving
}: {
    translationKey: string;
    initialValue: string;
    onSave: (k: string, v: string) => void;
    isSaving: boolean;
}) {
    const [value, setValue] = useState(initialValue);

    // Update local state if prop changes from external load
    // Not using useEffect to avoid overwriting typed-in but unsaved data, but we assume the user saves right away.

    const isDirty = value !== initialValue;

    return (
        <div className="flex gap-2">
            <Input
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="Empty..."
                className={`font-mono text-sm ${isDirty ? 'border-primary' : ''}`}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && isDirty && !isSaving) {
                        onSave(translationKey, value);
                    }
                }}
            />
            {isDirty && (
                <Button
                    size="icon"
                    variant="default"
                    disabled={isSaving}
                    onClick={() => onSave(translationKey, value)}
                >
                    {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                </Button>
            )}
        </div>
    );
}
