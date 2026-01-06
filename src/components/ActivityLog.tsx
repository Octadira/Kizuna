"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import {
    Server,
    Zap,
    Star,
    Archive,
    Puzzle,
    Github,
    Users,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Filter,
    RefreshCw,
    Clock,
    User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// Types
interface AuditLog {
    id: string;
    created_at: string;
    user_id: string;
    action: string;
    resource_type: string;
    resource_id: string | null;
    metadata: Record<string, unknown>;
    // Joined from auth.users (only for admin view)
    user_email?: string;
}

interface ActivityLogProps {
    isAdmin: boolean;
}

// Pagination config
const PAGE_SIZE = 15;

// Action display config
const ACTION_CONFIG: Record<string, { label: string; icon: typeof Server; color: string }> = {
    'server.create': { label: 'Server Created', icon: Server, color: 'text-green-500' },
    'server.update': { label: 'Server Updated', icon: Server, color: 'text-blue-500' },
    'server.delete': { label: 'Server Deleted', icon: Server, color: 'text-red-500' },
    'workflow.toggle_status': { label: 'Workflow Toggled', icon: Zap, color: 'text-yellow-500' },
    'workflow.backup_create': { label: 'Backup Created', icon: Archive, color: 'text-green-500' },
    'workflow.backup_delete': { label: 'Backup Deleted', icon: Archive, color: 'text-red-500' },
    'workflow.backup_restore': { label: 'Backup Restored', icon: Archive, color: 'text-blue-500' },
    'workflow.note_save': { label: 'Note Saved', icon: Zap, color: 'text-purple-500' },
    'workflow.push_github': { label: 'Pushed to GitHub', icon: Github, color: 'text-gray-500' },
    'favorite.add': { label: 'Added to Favorites', icon: Star, color: 'text-yellow-500' },
    'favorite.remove': { label: 'Removed from Favorites', icon: Star, color: 'text-gray-500' },
    'plugin.toggle': { label: 'Plugin Toggled', icon: Puzzle, color: 'text-purple-500' },
    'github.connect': { label: 'GitHub Connected', icon: Github, color: 'text-green-500' },
    'github.disconnect': { label: 'GitHub Disconnected', icon: Github, color: 'text-red-500' },
    'admin.user_role_update': { label: 'User Role Updated', icon: Users, color: 'text-orange-500' },
};

// Filter options
const FILTER_OPTIONS = [
    { value: 'all', label: 'All Activities' },
    { value: 'server', label: 'Servers' },
    { value: 'workflow', label: 'Workflows' },
    { value: 'backup', label: 'Backups' },
    { value: 'favorite', label: 'Favorites' },
    { value: 'plugin', label: 'Plugins' },
];

export function ActivityLog({ isAdmin }: ActivityLogProps) {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showAllUsers, setShowAllUsers] = useState(false);

    const supabase = createClient();

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('audit_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

            // Apply filter
            if (filter !== 'all') {
                query = query.eq('resource_type', filter);
            }

            // Admin can toggle between all users and just their own
            // For non-admin, RLS automatically filters to their own logs
            if (!showAllUsers && isAdmin) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    query = query.eq('user_id', user.id);
                }
            }

            const { data, error: queryError } = await query;

            if (queryError) throw queryError;

            setLogs(data || []);
            setHasMore((data?.length || 0) === PAGE_SIZE);
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
            setError(err instanceof Error ? err.message : 'Failed to load activity');
        } finally {
            setIsLoading(false);
        }
    }, [page, filter, showAllUsers, isAdmin, supabase]);

    // Fetch on mount and when dependencies change
    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // Reset page when filter changes
    useEffect(() => {
        setPage(0);
    }, [filter, showAllUsers]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
    };

    const getActionConfig = (action: string) => {
        return ACTION_CONFIG[action] || {
            label: action.replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            icon: Clock,
            color: 'text-muted-foreground'
        };
    };

    const getMetadataPreview = (metadata: Record<string, unknown>) => {
        if (metadata.name) return String(metadata.name);
        if (metadata.workflowName) return String(metadata.workflowName);
        if (metadata.enabled !== undefined) return metadata.enabled ? 'Enabled' : 'Disabled';
        if (metadata.newStatus) return String(metadata.newStatus);
        return null;
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Filter Dropdown */}
                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-muted-foreground" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-background border border-border rounded-md px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                        {FILTER_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Admin Toggle */}
                {isAdmin && (
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showAllUsers}
                            onChange={(e) => setShowAllUsers(e.target.checked)}
                            className="rounded border-border"
                        />
                        <Users size={14} />
                        <span className="text-muted-foreground">Show all users</span>
                    </label>
                )}

                {/* Refresh Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchLogs}
                    disabled={isLoading}
                    className="ml-auto"
                >
                    <RefreshCw size={14} className={cn(isLoading && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            {/* Content */}
            {error ? (
                <div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20 text-sm">
                    {error}
                </div>
            ) : isLoading && logs.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : logs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No activity recorded yet</p>
                    <p className="text-xs mt-1">Actions you take will appear here</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {logs.map((log) => {
                        const config = getActionConfig(log.action);
                        const Icon = config.icon;
                        const preview = getMetadataPreview(log.metadata);

                        return (
                            <div
                                key={log.id}
                                className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border/50 hover:border-border transition-colors"
                            >
                                {/* Icon */}
                                <div className={cn(
                                    "flex-shrink-0 p-2 rounded-md bg-muted/50",
                                    config.color
                                )}>
                                    <Icon size={16} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-medium text-sm">
                                            {config.label}
                                        </span>
                                        {preview && (
                                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                • {preview}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                        <Clock size={10} />
                                        {formatDate(log.created_at)}
                                        {showAllUsers && log.user_id && (
                                            <>
                                                <span>•</span>
                                                <User size={10} />
                                                <span className="truncate max-w-[150px]">
                                                    {log.user_id.slice(0, 8)}...
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {(logs.length > 0 || page > 0) && (
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0 || isLoading}
                    >
                        <ChevronLeft size={14} />
                        Previous
                    </Button>
                    <span className="text-xs text-muted-foreground">
                        Page {page + 1}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(p => p + 1)}
                        disabled={!hasMore || isLoading}
                    >
                        Next
                        <ChevronRight size={14} />
                    </Button>
                </div>
            )}
        </div>
    );
}
