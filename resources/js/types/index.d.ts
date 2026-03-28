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

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface Workspace {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    logo_url: string | null;
    accent_color: string | null;
    billing_email?: string | null;
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

export interface WorkspaceInviteLink {
    id: number;
    token: string;
    role: WorkspaceRole;
    max_uses: number | null;
    uses_count: number;
    expires_at: string | null;
    created_at: string;
    url: string;
}

export interface TeamMember {
    id: number;
    name: string;
    email: string;
    role: WorkspaceRole;
    permissions?: string[];
    joined_at: string;
    is_current_user: boolean;
    bio?: string | null;
    timezone?: string;
    last_seen_at?: string | null;
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
    features?: Record<string, boolean>;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    avatar_url?: string | null;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    current_workspace_id?: number;
    locale?: string;
    is_superadmin?: boolean;
    bio?: string | null;
    timezone?: string;
    date_format?: string;
    profile_completeness?: { score: number; missing: string[] };
    [key: string]: unknown;
}

export interface SecuritySummary {
    authentication: {
        password: {
            enabled: boolean;
            last_changed_at: string | null;
        };
        two_factor: {
            enabled: boolean;
            confirmed_at: string | null;
        };
        social_accounts: Array<{
            id: number;
            provider: string;
            provider_name: string;
            connected_at: string;
        }>;
    };
    security_score: number;
    recommendations: Array<{
        text: string;
        priority: 'high' | 'medium' | 'low';
        action?: string;
    }>;
}

export interface SessionSummary {
    total_sessions: number;
    other_sessions_count: number;
    current_session: {
        id: string;
        ip_address: string;
        device: string;
        platform: string;
        browser: string;
        last_active: string;
    } | null;
    last_other_activity: {
        ip_address: string;
        device: string;
        platform: string;
        last_active: string;
    } | null;
}

export type Tag = {
    id: number;
    name: string;
    slug: string;
    color: string;
    description?: string | null;
};

export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'boolean' | 'select' | 'url';

export interface CustomField {
    id: number;
    name: string;
    field_type: FieldType;
    options: string[] | null;
    is_required: boolean;
    sort_order: number;
}

export interface WorkspaceTemplate {
    id: number;
    name: string;
    description: string | null;
    category: string;
    is_public: boolean;
    usage_count: number;
    created_at: string;
    updated_at: string;
    creator?: {
        id: number;
        name: string;
    };
    configuration?: {
        settings?: Record<string, unknown>;
        custom_fields?: unknown[];
        tags?: unknown[];
        branding?: {
            accent_color: string | null;
        };
        webhooks?: unknown[];
    };
}

declare global {
    interface Window {
        Pusher: typeof import('pusher-js').default;
        Echo: import('laravel-echo').default;
    }
}
