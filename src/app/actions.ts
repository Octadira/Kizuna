"use server";

import { createClient } from "@/utils/supabase/server";
import { encrypt } from "@/utils/encryption";
import { revalidatePath } from "next/cache";
import { decrypt } from "@/utils/encryption";
import { getExecution, getN8nWorkflow } from "@/lib/n8n";
import { redirect } from "next/navigation";

import { validateServerUrl } from "@/lib/security";

export async function addServer(formData: FormData) {
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const url = formData.get("url") as string;
    const apiKey = formData.get("apiKey") as string;
    const description = formData.get("description") as string;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    // SSRF Protection: Validate URL
    await validateServerUrl(url);

    // Encrypt the API Key
    const encryptedKey = encrypt(apiKey);

    const { error } = await supabase.from("servers").insert({
        user_id: user.id,
        name,
        url,
        api_key: encryptedKey,
        description,
    });

    if (error) {
        console.error("Error adding server:", error);
        throw new Error("Failed to add server");
    }

    revalidatePath("/");
    redirect("/");
}

export async function toggleFavorite(serverId: string, workflowId: string, workflowName: string, isFavorite: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    if (isFavorite) {
        // Remove from favorites
        await supabase
            .from("favorites")
            .delete()
            .match({ user_id: user.id, server_id: serverId, workflow_id: workflowId });
    } else {
        // Add to favorites
        await supabase
            .from("favorites")
            .insert({
                user_id: user.id,
                server_id: serverId,
                workflow_id: workflowId,
                workflow_name: workflowName,
            });
    }

    revalidatePath(`/servers/${serverId}`);
    revalidatePath("/favorites");
}

import { toggleN8nWorkflowActive, createN8nWorkflow } from "@/lib/n8n";

export async function toggleWorkflowStatus(serverId: string, workflowId: string, isActive: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data: server } = await supabase
        .from("servers")
        .select("url, api_key")
        .eq("id", serverId)
        .single();

    if (!server) throw new Error("Server not found");

    const apiKey = decrypt(server.api_key);
    await toggleN8nWorkflowActive(server.url, apiKey, workflowId, isActive);

    revalidatePath(`/servers/${serverId}`);
}

export async function saveWorkflowNote(serverId: string, workflowId: string, note: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Check if note exists
    const { data: existingNote } = await supabase
        .from("workflow_notes")
        .select("id")
        .eq("user_id", user.id)
        .eq("server_id", serverId)
        .eq("workflow_id", workflowId)
        .single();

    if (existingNote) {
        await supabase
            .from("workflow_notes")
            .update({ note, updated_at: new Date().toISOString() })
            .eq("id", existingNote.id);
    } else {
        await supabase
            .from("workflow_notes")
            .insert({
                user_id: user.id,
                server_id: serverId,
                workflow_id: workflowId,
                note
            });
    }

    revalidatePath(`/servers/${serverId}/workflows/${workflowId}`);
}

export async function saveWorkflowBackup(serverId: string, workflowId: string, workflowName: string, workflowData: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${user.id}/${serverId}/${workflowId}/${timestamp}.json`;

    // 1. Upload to Storage
    const { error: uploadError } = await supabase.storage
        .from('backups')
        .upload(fileName, JSON.stringify(workflowData), {
            contentType: 'application/json',
            upsert: false
        });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    // 2. Save Metadata
    const { error: dbError } = await supabase
        .from("workflow_backups")
        .insert({
            user_id: user.id,
            server_id: serverId,
            workflow_id: workflowId,
            workflow_name: workflowName,
            storage_path: fileName
        });

    if (dbError) throw new Error(`Database save failed: ${dbError.message}`);

    revalidatePath(`/servers/${serverId}/workflows/${workflowId}`);
}

export async function deleteBackup(backupId: string, storagePath: string, serverId: string, workflowId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // 1. Delete from Storage
    await supabase.storage.from('backups').remove([storagePath]);

    // 2. Delete from DB
    await supabase.from("workflow_backups").delete().eq("id", backupId).eq("user_id", user.id);

    revalidatePath(`/servers/${serverId}/workflows/${workflowId}`);
}

// --- Workflow Template Actions ---

export async function saveWorkflowTemplate(name: string, description: string, workflowData: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Remove ID and other instance-specific data from template
    const templateData = { ...workflowData };
    delete templateData.id;
    delete templateData.active;
    delete templateData.createdAt;
    delete templateData.updatedAt;

    const { error } = await supabase.from("workflow_templates").insert({
        user_id: user.id,
        name,
        description,
        workflow_data: templateData
    });

    if (error) throw new Error(error.message);
    revalidatePath("/templates");
}

export async function getWorkflowTemplates() {
    const supabase = await createClient();
    const { data } = await supabase.from("workflow_templates").select("*").order("created_at", { ascending: false });
    return data || [];
}

// --- Cross-Server Actions ---

export async function deployWorkflowToServer(targetServerId: string, workflowData: any) {
    const supabase = await createClient();

    const { data: server } = await supabase
        .from("servers")
        .select("url, api_key")
        .eq("id", targetServerId)
        .single();

    if (!server) throw new Error("Target server not found");

    const apiKey = decrypt(server.api_key);

    // Clean data for new creation
    // Clean data for new creation - strictly whitelist allowed properties
    // Removing staticData, pinData, and tags to avoid "additional properties" error
    const allowedKeys = ['nodes', 'connections', 'settings'];
    const newWorkflowData: any = {
        name: `${workflowData.name} (Copy)`
    };

    for (const key of allowedKeys) {
        if (workflowData[key] !== undefined) {
            newWorkflowData[key] = workflowData[key];
        }
    }

    return await createN8nWorkflow(server.url, apiKey, newWorkflowData);
}

// --- Plugin System Actions ---

export async function getPlugins() {
    const supabase = await createClient();
    const { data } = await supabase.from("plugins").select("*").order("name");
    return data || [];
}

export async function togglePlugin(pluginId: string, enabled: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Authorization Check: Only admins can toggle plugins
    // We check the 'user_roles' table. If it doesn't exist yet, we fallback to allowing it (for backward compatibility during migration)
    // BUT for security, we should enforce it.
    // Assuming the user has run the migration script.

    const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

    // If table doesn't exist or user has no role, we default to 'user' (deny access)
    // UNLESS it's the very first setup where maybe we want to allow it? 
    // For strict security as requested: Deny if not admin.

    const isAdmin = roleData?.role === 'admin';

    if (!isAdmin) {
        // Fallback: If user_roles table doesn't exist, Supabase might return an error.
        // In a strict security audit fix, we must fail closed.
        // However, to avoid locking the user out if they haven't run the SQL yet, 
        // we might want to warn. But the prompt asks to FIX the vulnerability.
        // So we enforce admin check.
        throw new Error("Forbidden: Only administrators can manage plugins.");
    }

    await supabase.from("plugins").update({ enabled }).eq("id", pluginId);
    revalidatePath("/settings/plugins");
}

// ... (existing code) ...

export async function updateServer(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const url = formData.get("url") as string;
    const apiKey = formData.get("apiKey") as string;
    const description = formData.get("description") as string;

    // SSRF Protection: Validate URL
    await validateServerUrl(url);

    const updates: any = {
        name,
        url,
        description,
    };

    // Only update API key if provided (it's masked in UI usually)
    if (apiKey && apiKey.trim() !== "") {
        updates.api_key = encrypt(apiKey);
    }

    const { error } = await supabase
        .from("servers")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error updating server:", error);
        throw new Error(`Failed to update server: ${error.message}`);
    }

    revalidatePath("/");
    revalidatePath(`/servers/${id}`);
    redirect(`/servers/${id}`);
}

export async function fetchExecutionDetails(serverId: string, executionId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data: server } = await supabase
        .from("servers")
        .select("url, api_key")
        .eq("id", serverId)
        .single();

    if (!server) throw new Error("Server not found");

    const apiKey = decrypt(server.api_key);
    return await getExecution(server.url, apiKey, executionId);
}

export async function fetchFullWorkflow(serverId: string, workflowId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data: server } = await supabase
        .from("servers")
        .select("url, api_key")
        .eq("id", serverId)
        .single();

    if (!server) throw new Error("Server not found");

    const apiKey = decrypt(server.api_key);
    return await getN8nWorkflow(server.url, apiKey, workflowId);
}

export async function deleteServer(serverId: string) {

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error("[deleteServer] Unauthorized");
        throw new Error("Unauthorized");
    }

    // 1. Clean up Storage: Find all backups for this server

    const { data: backups } = await supabase
        .from("workflow_backups")
        .select("storage_path")
        .eq("server_id", serverId)
        .eq("user_id", user.id);

    if (backups && backups.length > 0) {

        const paths = backups.map(b => b.storage_path);
        const { error: storageError } = await supabase.storage
            .from("backups")
            .remove(paths);

        if (storageError) {
            console.error("[deleteServer] Error cleaning up backup files:", storageError);
            // We continue with server deletion even if storage cleanup fails
            // to avoid blocking the user, but ideally this should be logged/alerted.
        } else {

        }
    } else {

    }

    // 2. Delete Server (Cascades to favorites, notes, backup metadata)

    const { error } = await supabase
        .from("servers")
        .delete()
        .eq("id", serverId)
        .eq("user_id", user.id);

    if (error) {
        console.error("[deleteServer] Error deleting server:", error);
        throw new Error("Failed to delete server");
    }


    revalidatePath("/");

}
