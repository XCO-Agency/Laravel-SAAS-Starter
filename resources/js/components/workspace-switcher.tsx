import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Building2, Check, ChevronsUpDown, Plus, Settings } from 'lucide-react';

export function WorkspaceSwitcher() {
    const { currentWorkspace, workspaces } = usePage<SharedData>().props;
    const { isMobile } = useSidebar();

    const switchWorkspace = (workspaceId: number) => {
        router.post(`/workspaces/${workspaceId}/switch`);
    };

    if (!currentWorkspace) {
        return null;
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                {currentWorkspace.logo_url ? (
                                    <img
                                        src={currentWorkspace.logo_url}
                                        alt={currentWorkspace.name}
                                        className="size-8 rounded-lg object-cover"
                                    />
                                ) : (
                                    <Building2 className="size-4" />
                                )}
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {currentWorkspace.name}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {currentWorkspace.plan} Plan
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? 'bottom' : 'right'}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Workspaces
                        </DropdownMenuLabel>
                        {workspaces.map((workspace) => (
                            <DropdownMenuItem
                                key={workspace.id}
                                onClick={() => switchWorkspace(workspace.id)}
                                className="cursor-pointer gap-2 p-2"
                            >
                                <div className="flex size-6 items-center justify-center rounded-sm border">
                                    {workspace.logo_url ? (
                                        <img
                                            src={workspace.logo_url}
                                            alt={workspace.name}
                                            className="size-6 rounded-sm object-cover"
                                        />
                                    ) : (
                                        <Building2 className="size-4" />
                                    )}
                                </div>
                                <span className="flex-1 truncate">{workspace.name}</span>
                                {workspace.personal_workspace && (
                                    <span className="text-xs text-muted-foreground">Personal</span>
                                )}
                                {workspace.is_current && <Check className="ml-auto size-4" />}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer gap-2 p-2"
                            onClick={() => router.visit('/workspaces/settings')}
                        >
                            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                <Settings className="size-4" />
                            </div>
                            <span className="text-muted-foreground">Workspace Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="cursor-pointer gap-2 p-2"
                            onClick={() => router.visit('/workspaces/create')}
                        >
                            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                <Plus className="size-4" />
                            </div>
                            <span className="text-muted-foreground">Create Workspace</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

