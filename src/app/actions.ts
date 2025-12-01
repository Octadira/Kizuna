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
