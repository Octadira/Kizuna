"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchServerConnectionLogs, deleteServerConnectionLogs, deleteAllServerConnectionLogs, type ConnectionLog, type ConnectionLogsFilters } from "@/app/actions";
import { cn } from "@/lib/utils";
import {
    Terminal,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Filter,
    RefreshCw,
    Clock,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ServerConnectionLogsProps {
    serverId?: string; // If provided, only show logs for this server
    className?: string;
}

const PAGE_SIZE = 20;

// Error type colors
const ERROR_TYPE_COLORS: Record<string, string> = {
    'TIMEOUT': 'text-amber-500',
    'NETWORK_ERROR': 'text-red-500',
    'AUTH_ERROR': 'text-purple-500',
    'FORBIDDEN': 'text-orange-500',
    'NOT_FOUND': 'text-gray-500',
    'SERVER_ERROR': 'text-red-600',
    'SSL_ERROR': 'text-pink-500',
    'HTTP_ERROR': 'text-red-400',
};

export function ServerConnectionLogs({ serverId, className }: ServerConnectionLogsProps) {
    const [logs, setLogs] = useState<ConnectionLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

    // Filters
    const [filterSuccess, setFilterSuccess] = useState<boolean | undefined>(undefined);
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // Delete state
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteMode, setDeleteMode] = useState<'all' | 'range'>('all');
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteNotification, setDeleteNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const filters: ConnectionLogsFilters = {
                serverId,
                page,
                pageSize: PAGE_SIZE,
            };

            if (filterSuccess !== undefined) {
                filters.success = filterSuccess;
            }

            if (filterStartDate) {
                filters.startDate = new Date(filterStartDate).toISOString();
            }

            if (filterEndDate) {
                filters.endDate = new Date(filterEndDate).toISOString();
            }

            const result = await fetchServerConnectionLogs(filters);
            setLogs(result.logs);
            setTotalCount(result.totalCount);
            setHasMore(result.hasMore);
        } catch (err) {
            console.error('Failed to fetch connection logs:', err);
            setError(err instanceof Error ? err.message : 'Failed to load logs');
        } finally {
            setIsLoading(false);
        }
    }, [serverId, page, filterSuccess, filterStartDate, filterEndDate]);

    // Initial fetch
    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // Auto-refresh every 30s
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchLogs();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [autoRefresh, fetchLogs]);

    // Reset page when filters change
    useEffect(() => {
        setPage(0);
    }, [filterSuccess, filterStartDate, filterEndDate]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'GET': return 'text-blue-500';
            case 'POST': return 'text-green-500';
            case 'PUT': return 'text-amber-500';
            case 'DELETE': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const handleDeleteLogs = async () => {
        if (!serverId) {
            setDeleteNotification({ type: 'error', message: 'No server ID provided' });
            return;
        }

        setIsDeleting(true);
        setDeleteNotification(null);

        try {
            let result;
            if (deleteMode === 'all') {
                result = await deleteAllServerConnectionLogs(serverId);
            } else {
                // Delete with date range
                result = await deleteServerConnectionLogs(
                    serverId,
                    filterStartDate ? new Date(filterStartDate).toISOString() : undefined,
                    filterEndDate ? new Date(filterEndDate).toISOString() : undefined
                );
            }

            setDeleteNotification({
                type: 'success',
                message: `Successfully deleted ${result.deletedCount} log${result.deletedCount !== 1 ? 's' : ''}`
            });

            // Reset filters and refresh
            setFilterStartDate('');
            setFilterEndDate('');
            setPage(0);
            await fetchLogs();
        } catch (err) {
            setDeleteNotification({
                type: 'error',
                message: err instanceof Error ? err.message : 'Failed to delete logs'
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    // Auto-hide notification after 5 seconds
    useEffect(() => {
        if (!deleteNotification) return;

        const timer = setTimeout(() => {
            setDeleteNotification(null);
        }, 5000);

        return () => clearTimeout(timer);
    }, [deleteNotification]);

    return (
        <div className={cn("space-y-4", className)}>
            {/* Header & Filters */}
            <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-border">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Terminal size={16} className="text-muted-foreground" />
                    <span className="text-foreground">Connection Logs</span>
                    <span className="text-muted-foreground">({totalCount})</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 ml-auto">
                    {/* Success/Failure Filter */}
                    <select
                        value={filterSuccess === undefined ? 'all' : filterSuccess ? 'success' : 'failure'}
                        onChange={(e) => {
                            const val = e.target.value;
                            setFilterSuccess(val === 'all' ? undefined : val === 'success');
                        }}
                        className="bg-background border border-border rounded-md px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="success">✓ Successful</option>
                        <option value="failure">✗ Failed</option>
                    </select>

                    {/* Auto-refresh Toggle */}
                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="rounded border-border"
                        />
                        <span className="text-muted-foreground">Auto-refresh</span>
                    </label>

                    {/* Refresh Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchLogs}
                        disabled={isLoading}
                    >
                        <RefreshCw size={14} className={cn(isLoading && "animate-spin")} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Date Range Filters */}
            <div className="flex flex-wrap items-center gap-2 text-sm">
                <Filter size={14} className="text-muted-foreground" />
                <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="bg-background border border-border rounded px-2 py-1 text-sm"
                    placeholder="Start date"
                />
                <span className="text-muted-foreground">to</span>
                <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="bg-background border border-border rounded px-2 py-1 text-sm"
                    placeholder="End date"
                />
                {(filterStartDate || filterEndDate) && (
                    <button
                        onClick={() => {
                            setFilterStartDate('');
                            setFilterEndDate('');
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground underline"
                    >
                        Clear dates
                    </button>
                )}
            </div>

            {/* Delete Logs Section */}
            {serverId && logs.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border/50">
                    <Trash2 size={14} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Delete logs:</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setDeleteMode('range');
                            setShowDeleteDialog(true);
                        }}
                        disabled={!filterStartDate && !filterEndDate}
                        className="text-xs"
                    >
                        Delete Filtered
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setDeleteMode('all');
                            setShowDeleteDialog(true);
                        }}
                        className="text-xs text-destructive hover:text-destructive"
                    >
                        Delete All
                    </Button>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteDialog(false)}>
                    <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                            <AlertTriangle className="text-destructive" size={20} />
                            Confirm Deletion
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {deleteMode === 'all' ? (
                                <>
                                    You are about to delete <strong className="text-foreground">ALL connection logs</strong> for this server.
                                    This action cannot be undone.
                                </>
                            ) : (
                                <>
                                    You are about to delete logs
                                    {filterStartDate && <> from <strong className="text-foreground">{filterStartDate}</strong></>}
                                    {filterEndDate && <> to <strong className="text-foreground">{filterEndDate}</strong></>}.
                                    This action cannot be undone.
                                </>
                            )}
                        </p>
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="ghost"
                                onClick={() => setShowDeleteDialog(false)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleDeleteLogs}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={14} />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={14} className="mr-2" />
                                        Delete Logs
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Banner */}
            {deleteNotification && (
                <div className={cn(
                    "p-3 rounded-lg border text-sm flex items-center gap-2",
                    deleteNotification.type === 'success' ?
                        "bg-green-500/10 border-green-500/20 text-green-500" :
                        "bg-destructive/10 border-destructive/20 text-destructive"
                )}>
                    {deleteNotification.type === 'success' ? (
                        <CheckCircle2 size={16} />
                    ) : (
                        <XCircle size={16} />
                    )}
                    {deleteNotification.message}
                </div>
            )}

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
                    <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No connection logs found</p>
                    <p className="text-xs mt-1">Logs will appear here when servers are accessed</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {logs.map((log) => {
                        const isExpanded = expandedLogId === log.id;

                        return (
                            <div
                                key={log.id}
                                className={cn(
                                    "border rounded-lg transition-colors",
                                    log.success ? "border-border/50 bg-card" : "border-red-500/20 bg-red-500/5"
                                )}
                            >
                                {/* Main Row */}
                                <div className="flex items-start gap-3 p-3">
                                    {/* Status Icon */}
                                    <div className="flex-shrink-0 mt-0.5">
                                        {log.success ? (
                                            <CheckCircle2 size={16} className="text-green-500" />
                                        ) : (
                                            <XCircle size={16} className="text-red-500" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 space-y-1">
                                        {/* Method & Endpoint */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={cn("font-mono text-xs font-semibold", getMethodColor(log.method))}>
                                                {log.method}
                                            </span>
                                            <span className="font-mono text-xs text-foreground truncate">
                                                {log.endpoint}
                                            </span>
                                            {log.status_code && (
                                                <span className={cn(
                                                    "text-xs px-1.5 py-0.5 rounded font-mono",
                                                    log.status_code >= 200 && log.status_code < 300 ? "bg-green-500/10 text-green-500" :
                                                        log.status_code >= 400 && log.status_code < 500 ? "bg-amber-500/10 text-amber-500" :
                                                            "bg-red-500/10 text-red-500"
                                                )}>
                                                    {log.status_code}
                                                </span>
                                            )}
                                        </div>

                                        {/* Metadata */}
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Clock size={10} />
                                                {formatDate(log.created_at)}
                                            </span>
                                            <span>•</span>
                                            <span className={cn(
                                                "font-mono",
                                                log.response_time_ms < 1000 ? "text-green-500" :
                                                    log.response_time_ms < 3000 ? "text-amber-500" :
                                                        "text-red-500"
                                            )}>
                                                {log.response_time_ms}ms
                                            </span>
                                            {log.error_type && (
                                                <>
                                                    <span>•</span>
                                                    <span className={cn(
                                                        "flex items-center gap-1 font-medium",
                                                        ERROR_TYPE_COLORS[log.error_type] || 'text-red-400'
                                                    )}>
                                                        <AlertTriangle size={10} />
                                                        {log.error_type.replace(/_/g, ' ')}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        {/* Error Message Preview */}
                                        {!log.success && log.error_message && !isExpanded && (
                                            <p className="text-xs text-red-400 truncate mt-1">
                                                {log.error_message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Expand Button */}
                                    {(!log.success && log.error_message) && (
                                        <button
                                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                            className="flex-shrink-0 p-1 hover:bg-accent rounded transition-colors"
                                        >
                                            {isExpanded ? (
                                                <ChevronUp size={16} className="text-muted-foreground" />
                                            ) : (
                                                <ChevronDown size={16} className="text-muted-foreground" />
                                            )}
                                        </button>
                                    )}
                                </div>

                                {/* Expanded Error Details */}
                                {isExpanded && log.error_message && (
                                    <div className="px-3 pb-3 pt-0">
                                        <div className="bg-red-500/5 border border-red-500/20 rounded p-2">
                                            <p className="text-xs font-mono text-red-400 whitespace-pre-wrap">
                                                {log.error_message}
                                            </p>
                                        </div>
                                    </div>
                                )}
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
                        Page {page + 1} {totalCount > 0 && `• ${totalCount} total`}
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
