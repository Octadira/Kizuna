import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { decrypt } from "@/utils/encryption";
import { getServerStatus } from "@/lib/n8n";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ serverId: string }> }
) {
    try {
        const { serverId } = await params;

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: server } = await supabase
            .from("servers")
            .select("url, api_key")
            .eq("id", serverId)
            .single();

        if (!server) {
            return NextResponse.json({ error: "Server not found" }, { status: 404 });
        }

        const apiKey = decrypt(server.api_key);

        // Skip version check for fast loading (true = skip)
        const status = await getServerStatus(server.url, apiKey, true);

        return NextResponse.json(status);
    } catch (error) {
        console.error("Error fetching server status:", error);
        return NextResponse.json(
            { online: false, workflowCount: 0, activeWorkflowCount: 0 },
            { status: 200 } // Return 200 with offline status instead of error
        );
    }
}
