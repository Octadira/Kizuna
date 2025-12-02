"use server";

import { createClient } from "@/utils/supabase/server";
import { encrypt } from "@/utils/encryption";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

import { decrypt } from "@/utils/encryption";
import { toggleN8nWorkflowActive } from "@/lib/n8n";

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

import { getExecution } from "@/lib/n8n";

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

// --- Plugin System Actions ---

export async function getPlugins() {
    const supabase = await createClient();
    const { data } = await supabase.from("plugins").select("*").order("name");
    return data || [];
}

export async function togglePlugin(pluginId: string, enabled: boolean) {
    const supabase = await createClient();
    await supabase.from("plugins").update({ enabled }).eq("id", pluginId);
    revalidatePath("/settings/plugins");
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

import { createN8nWorkflow } from "@/lib/n8n";

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

export async function updateServer(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const url = formData.get("url") as string;
    const apiKey = formData.get("apiKey") as string;
    const description = formData.get("description") as string;

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
