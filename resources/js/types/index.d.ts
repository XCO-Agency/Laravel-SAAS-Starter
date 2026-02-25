import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
    is_impersonating?: boolean;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    external?: boolean;
}

export type WorkspaceRole = 'owner' | 'admin' | 'member';

export interface Workspace {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    logo_url: string | null;
    personal_workspace: boolean;
    owner_id?: number;
    plan?: string;
    role?: WorkspaceRole;
    is_current?: boolean;
    members_count?: number;
}

export interface WorkspaceInvitation {
    id: number;
    email: string;
    role: WorkspaceRole;
    expires_at: string;
    created_at: string;
}

export interface TeamMember {
    id: number;
    name: string;
    email: string;
    role: WorkspaceRole;
    permissions?: string[];
    joined_at: string;
    is_current_user: boolean;
}

export interface Plan {
    id: string;
    name: string;
    description: string;
    price: {
        monthly: number;
        yearly: number;
    };
    features: string[];
    limits: {
        workspaces: number;
        team_members: number;
    };
    popular?: boolean;
}

export interface Invoice {
    id: string;
    date: string;
    total: string;
    pdf_url: string;
}

export interface Flash {
    success?: string;
    error?: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    currentWorkspace: Workspace | null;
    workspaces: Workspace[];
    sidebarOpen: boolean;
    flash: Flash;
    locale?: string;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    current_workspace_id?: number;
    locale?: string;
    is_superadmin?: boolean;
    [key: string]: unknown;
}
