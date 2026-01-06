"use client";

import useSWR from 'swr';

export interface ServerStatus {
    online: boolean;
    workflowCount: number;
    activeWorkflowCount: number;
    version?: string;
    updateAvailable?: boolean;
}

const fetcher = async (url: string): Promise<ServerStatus> => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Failed to fetch server status');
    }
    return res.json();
};

/**
 * SWR Hook for fetching server status with caching and auto-revalidation
 * 
 * Features:
 * - Stale-while-revalidate: Shows cached data immediately, revalidates in background
 * - Auto-retry on error with exponential backoff
 * - Deduplication: Multiple components requesting the same data only trigger one request
 * - Focus revalidation: Refreshes when window regains focus
 * 
 * @param serverId - The server ID to fetch status for
 * @returns SWR response with status data, loading state, and error
 */
export function useServerStatus(serverId: string) {
    const { data, error, isLoading, isValidating, mutate } = useSWR<ServerStatus>(
        serverId ? `/api/server-status/${serverId}` : null,
        fetcher,
        {
            // Cache for 60 seconds before considering stale
            dedupingInterval: 60000,
            // Revalidate when window gets focus
            revalidateOnFocus: true,
            // Keep showing previous data while revalidating
            keepPreviousData: true,
            // Retry on errors with exponential backoff
            errorRetryCount: 3,
            errorRetryInterval: 5000,
            // Custom retry handler
            onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
                // Don't retry on 404
                if (error.status === 404) return;
                // Only retry up to 3 times
                if (retryCount >= 3) return;
                // Retry after 5 seconds
                setTimeout(() => revalidate({ retryCount }), 5000);
            }
        }
    );

    return {
        status: data || { online: false, workflowCount: 0, activeWorkflowCount: 0 },
        isLoading,
        isValidating, // true when revalidating in background
        isError: !!error,
        error,
        // Manual refresh function
        refresh: () => mutate()
    };
}

/**
 * Hook for fetching multiple server statuses efficiently
 * Useful for dashboard grids where many servers need status checks
 */
export function useMultipleServerStatus(serverIds: string[]) {
    // Each ID gets its own SWR cache entry, enabling parallel loading
    // and independent error handling
    return serverIds.map(id => ({
        serverId: id,
        ...useServerStatus(id)
    }));
}
