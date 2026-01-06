import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { decrypt } from "@/utils/encryption";
import { getServerStatus } from "@/lib/n8n";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ serverId: string }> }
) {
    const startTime = Date.now();
    let debugInfo: Record<string, unknown> = {};

    try {
        const { serverId } = await params;
        debugInfo.serverId = serverId;

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: server } = await supabase
            .from("servers")
            .select("url, api_key, name")
            .eq("id", serverId)
            .single();

        if (!server) {
            return NextResponse.json({ error: "Server not found" }, { status: 404 });
        }

        debugInfo.serverName = server.name;
        debugInfo.serverUrl = server.url;
        debugInfo.hasApiKey = !!server.api_key;

        let apiKey: string;
        try {
            apiKey = decrypt(server.api_key);
            debugInfo.decryptSuccess = true;
            debugInfo.apiKeyLength = apiKey.length;
        } catch (decryptError) {
            debugInfo.decryptSuccess = false;
            debugInfo.decryptError = decryptError instanceof Error ? decryptError.message : 'Unknown decrypt error';
            console.error(`[server-status] Decryption failed for ${server.name}:`, decryptError);
            return NextResponse.json(
                { online: false, workflowCount: 0, activeWorkflowCount: 0, debug: { error: 'decrypt_failed' } },
                { status: 200 }
            );
        }

        // Skip version check for fast loading (true = skip)
        const status = await getServerStatus(server.url, apiKey, true);

        debugInfo.statusResult = status;
        debugInfo.duration = Date.now() - startTime;

        console.log(`[server-status] ${server.name} checked in ${debugInfo.duration}ms:`, JSON.stringify(debugInfo));

        return NextResponse.json(status);
    } catch (error) {
        debugInfo.error = error instanceof Error ? error.message : 'Unknown error';
        debugInfo.errorStack = error instanceof Error ? error.stack : undefined;
        debugInfo.duration = Date.now() - startTime;

        console.error("[server-status] Error fetching server status:", JSON.stringify(debugInfo), error);
        return NextResponse.json(
            { online: false, workflowCount: 0, activeWorkflowCount: 0 },
            { status: 200 } // Return 200 with offline status instead of error
        );
    }
}
