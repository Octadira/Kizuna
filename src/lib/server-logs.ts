/**
 * Server Connection Logging Utility
 * 
 * Provides functions to log all server connection attempts (successful and failed)
 * to the server_connection_logs table for troubleshooting and monitoring.
 */

import { createClient } from "@/utils/supabase/server";

export interface LogConnectionParams {
    serverId: string;
    endpoint: string;
    method: string;
    success: boolean;
    statusCode?: number;
    responseTimeMs: number;
    errorType?: string;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Error type detector - categorizes errors for better filtering
 */
export function detectErrorType(error: any): string {
    if (!error) return 'UNKNOWN_ERROR';

    const errorMessage = error.message?.toLowerCase() || '';
    const errorName = error.name?.toLowerCase() || '';

    // Timeout errors
    if (errorMessage.includes('timeout') ||
        errorMessage.includes('aborted') ||
        errorName === 'aborterror') {
        return 'TIMEOUT';
    }

    // Network errors
    if (errorMessage.includes('network') ||
        errorMessage.includes('fetch failed') ||
        errorMessage.includes('econnrefused') ||
        errorMessage.includes('enotfound')) {
        return 'NETWORK_ERROR';
    }

    // Authentication errors
    if (errorMessage.includes('unauthorized') ||
        errorMessage.includes('401') ||
        errorMessage.includes('api key')) {
        return 'AUTH_ERROR';
    }

    // HTTP errors
    if (errorMessage.includes('403')) return 'FORBIDDEN';
    if (errorMessage.includes('404')) return 'NOT_FOUND';
    if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
        return 'SERVER_ERROR';
    }

    // SSL/TLS errors
    if (errorMessage.includes('ssl') ||
        errorMessage.includes('certificate') ||
        errorMessage.includes('tls')) {
        return 'SSL_ERROR';
    }

    // CORS errors
    if (errorMessage.includes('cors')) {
        return 'CORS_ERROR';
    }

    return 'HTTP_ERROR';
}

/**
 * Logs a server connection attempt to the database
 * This is non-blocking and will not throw errors to avoid disrupting the main flow
 */
export async function logServerConnection(params: LogConnectionParams): Promise<void> {
    try {
        const supabase = await createClient();

        // Get current user (for user_id)
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.warn('[Server Logs] Cannot log connection - no authenticated user');
            return;
        }

        const { error } = await supabase
            .from('server_connection_logs')
            .insert({
                user_id: user.id,
                server_id: params.serverId,
                endpoint: params.endpoint,
                method: params.method,
                success: params.success,
                status_code: params.statusCode,
                response_time_ms: params.responseTimeMs,
                error_type: params.errorType,
                error_message: params.errorMessage ?
                    // Truncate long error messages
                    params.errorMessage.substring(0, 500) :
                    undefined,
                metadata: params.metadata || {}
            });

        if (error) {
            console.error('[Server Logs] Failed to insert log:', error);
        }
    } catch (err) {
        // Silent fail - logging should never break the main flow
        console.error('[Server Logs] Unexpected error:', err);
    }
}

/**
 * Helper to extract endpoint from full URL
 * Example: "https://n8n.example.com/api/v1/workflows" -> "/api/v1/workflows"
 */
export function extractEndpoint(url: string): string {
    try {
        const urlObj = new URL(url);
        return urlObj.pathname + urlObj.search;
    } catch {
        // If URL parsing fails, return the entire string
        return url;
    }
}
