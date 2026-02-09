/**
 * Audit Logging System
 * 
 * Provides centralized logging for all user actions in the application.
 * Logs are stored in the `audit_logs` Supabase table.
 */

import { createClient } from "@/utils/supabase/server";

export type AuditAction =
    // Server actions
    | 'server.create'
    | 'server.update'
    | 'server.delete'
    // Workflow actions
    | 'workflow.toggle_status'
    | 'workflow.backup_create'
    | 'workflow.backup_delete'
    | 'workflow.backup_restore'
    | 'workflow.note_save'
    | 'workflow.push_github'
    // Template actions
    | 'template.create'
    | 'template.deploy'
    // Favorite actions
    | 'favorite.add'
    | 'favorite.remove'
    // Plugin actions
    | 'plugin.toggle'
    // Integration actions
    | 'github.connect'
    | 'github.disconnect'
    // Admin actions
    | 'admin.user_role_update'
    // Server logs actions
    | 'server_logs.delete';

export type ResourceType =
    | 'server'
    | 'workflow'
    | 'backup'
    | 'template'
    | 'favorite'
    | 'plugin'
    | 'github_integration'
    | 'user'
    | 'server_connection_logs';

export interface AuditLogEntry {
    action: AuditAction;
    resource_type: ResourceType;
    resource_id?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Log an action to the audit_logs table
 * 
 * @param entry - The audit log entry to create
 * @returns The created log entry or null if failed
 * 
 * @example
 * ```typescript
 * await logAudit({
 *   action: 'server.create',
 *   resource_type: 'server',
 *   resource_id: serverId,
 *   metadata: { name: serverName }
 * });
 * ```
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.warn('[Audit] No user found, skipping audit log');
            return;
        }

        const { error } = await supabase
            .from('audit_logs')
            .insert({
                user_id: user.id,
                action: entry.action,
                resource_type: entry.resource_type,
                resource_id: entry.resource_id || null,
                metadata: entry.metadata || {}
            });

        if (error) {
            // Log the error but don't throw - audit failures shouldn't break the main flow
            console.error('[Audit] Failed to create audit log:', error.message);
        }
    } catch (err) {
        console.error('[Audit] Unexpected error:', err);
    }
}

/**
 * Batch log multiple actions (useful for bulk operations)
 */
export async function logAuditBatch(entries: AuditLogEntry[]): Promise<void> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.warn('[Audit] No user found, skipping audit log batch');
            return;
        }

        const logs = entries.map(entry => ({
            user_id: user.id,
            action: entry.action,
            resource_type: entry.resource_type,
            resource_id: entry.resource_id || null,
            metadata: entry.metadata || {}
        }));

        const { error } = await supabase
            .from('audit_logs')
            .insert(logs);

        if (error) {
            console.error('[Audit] Failed to create batch audit logs:', error.message);
        }
    } catch (err) {
        console.error('[Audit] Unexpected error in batch:', err);
    }
}
