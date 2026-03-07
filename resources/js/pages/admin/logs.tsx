import { Head, Link, router } from '@inertiajs/react';
import {
    Terminal,
    Download,
    Trash2,
    FileText,
    AlertCircle,
    Info,
    AlertTriangle,
    Search
} from 'lucide-react';
import { useState, useMemo } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface LogFile {
    name: string;
    size: string;
    last_modified: string;
}

interface LogEntry {
    id: number;
    timestamp: string;
    environment: string;
    level: string;
    message: string;
}

interface LogsProps {
    files: LogFile[];
    currentFile: LogFile | null;
    logs: LogEntry[];
}

export default function Logs({ files, currentFile, logs }: LogsProps) {
    const [search, setSearch] = useState('');
    const [levelFilter, setLevelFilter] = useState<string>('all');
    const [isDeleting, setIsDeleting] = useState(false);

    const getLevelBadge = (level: string) => {
        switch (level.toUpperCase()) {
            case 'ERROR':
            case 'CRITICAL':
            case 'ALERT':
            case 'EMERGENCY':
                return <Badge variant="destructive" className="flex gap-1 items-center"><AlertCircle className="size-3" /> {level}</Badge>;
            case 'WARNING':
                return <Badge variant="outline" className="text-amber-600 border-amber-600 bg-amber-50 flex gap-1 items-center dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-400"><AlertTriangle className="size-3" /> {level}</Badge>;
            case 'INFO':
            case 'NOTICE':
                return <Badge variant="secondary" className="flex gap-1 items-center bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300"><Info className="size-3" /> {level}</Badge>;
            default:
                return <Badge variant="outline">{level}</Badge>;
        }
    };

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) ||
                log.timestamp.includes(search);
            const matchesLevel = levelFilter === 'all' || log.level.toUpperCase() === levelFilter.toUpperCase();

            return matchesSearch && matchesLevel;
        });
    }, [logs, search, levelFilter]);

    const handleFileChange = (filename: string) => {
        router.get(`/admin/logs/${filename}`);
    };

    const handleDelete = () => {
        if (!currentFile) return;
        setIsDeleting(true);
        router.delete(`/admin/logs/${currentFile.name}`, {
            onFinish: () => setIsDeleting(false),
        });
    };

    const levels = ['all', ...Array.from(new Set(logs.map(log => log.level.toUpperCase())))];

    return (
        <AdminLayout>
            <Head title="System Logs" />

            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">System Logs</h2>
                        <p className="text-muted-foreground">
                            View and manage application log files.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-12">
                    {/* Sidebar / File List */}
                    <div className="md:col-span-3 space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <FileText className="size-4" />
                                    Log Files
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="flex flex-col">
                                    {files.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            No log files found.
                                        </div>
                                    ) : (
                                        files.map((file) => (
                                            <button
                                                key={file.name}
                                                onClick={() => handleFileChange(file.name)}
                                                className={`flex flex-col items-start gap-1 border-b p-4 text-left text-sm transition-colors hover:bg-muted/50 ${currentFile?.name === file.name ? 'bg-muted' : ''}`}
                                            >
                                                <div className="font-medium">{file.name}</div>
                                                <div className="flex w-full justify-between text-xs text-muted-foreground">
                                                    <span>{file.size}</span>
                                                    <span>{file.last_modified}</span>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Log Viewer */}
                    <div className="md:col-span-9 space-y-4">
                        <Card className="h-full flex flex-col">
                            {currentFile ? (
                                <>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                        <div>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Terminal className="size-5" />
                                                {currentFile.name}
                                            </CardTitle>
                                            <CardDescription>
                                                {currentFile.size} • Modified: {currentFile.last_modified}
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={`/admin/logs/${currentFile.name}/download`} target="_blank" rel="noreferrer">
                                                    <Download className="mr-2 size-4" />
                                                    Download
                                                </a>
                                            </Button>

                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="destructive" size="sm">
                                                        <Trash2 className="mr-2 size-4" />
                                                        Delete
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                                                        <DialogDescription>
                                                            This will permanently delete the <strong>{currentFile.name}</strong> log file from the server. This action cannot be undone.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <DialogFooter>
                                                        <Button variant="outline" onClick={() => setIsDeleting(false)}>Cancel</Button>
                                                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                                                            {isDeleting ? 'Deleting...' : 'Delete Log File'}
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </CardHeader>
                                    <div className="px-6 pb-4 flex flex-col sm:flex-row gap-4 items-center border-b">
                                        <div className="relative flex-1 w-full">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="search"
                                                placeholder="Search logs..."
                                                className="pl-8"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                            />
                                        </div>
                                        <div className="w-full sm:w-[180px]">
                                            <Select value={levelFilter} onValueChange={setLevelFilter}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Filter by level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {levels.map(level => (
                                                        <SelectItem key={level} value={level}>
                                                            {level === 'all' ? 'All Levels' : level}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <CardContent className="p-0 flex-1 overflow-auto max-h-[800px]">
                                        {logs.length === 0 ? (
                                            <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
                                                <Terminal className="size-10 text-muted-foreground/30 mb-2" />
                                                <p>No entries found in this log file.</p>
                                            </div>
                                        ) : filteredLogs.length === 0 ? (
                                            <div className="p-8 text-center text-muted-foreground">
                                                No logs match your search criteria.
                                            </div>
                                        ) : (
                                            <Table>
                                                <TableHeader className="sticky top-0 bg-background z-10">
                                                    <TableRow>
                                                        <TableHead className="w-[180px]">Timestamp</TableHead>
                                                        <TableHead className="w-[120px]">Level</TableHead>
                                                        <TableHead>Message</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredLogs.map((log) => (
                                                        <TableRow key={log.id}>
                                                            <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap align-top pt-4">
                                                                {log.timestamp}
                                                                <div className="mt-1 text-muted-foreground/50">{log.environment}</div>
                                                            </TableCell>
                                                            <TableCell className="align-top pt-4">
                                                                {getLevelBadge(log.level)}
                                                            </TableCell>
                                                            <TableCell className="font-mono text-xs break-all whitespace-pre-wrap">
                                                                {log.message}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </CardContent>
                                </>
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground border-dashed border-2 m-4 rounded-xl">
                                    <FileText className="mb-4 size-10 opacity-20" />
                                    <p className="text-lg font-medium">No file selected</p>
                                    <p className="text-sm">Select a log file from the sidebar to view its contents.</p>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
