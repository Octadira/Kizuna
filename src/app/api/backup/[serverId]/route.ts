import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import JSZip from "jszip";

// HEAD request to check if backups exist (without downloading)
export async function HEAD(
    request: NextRequest,
    { params }: { params: Promise<{ serverId: string }> }
) {
    const { serverId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return new NextResponse(null, { status: 401 });
    }

    const { count } = await supabase
        .from("workflow_backups")
        .select("*", { count: "exact", head: true })
        .eq("server_id", serverId)
        .eq("user_id", user.id);

    if (!count || count === 0) {
        return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(null, {
        status: 200,
        headers: { "X-Backup-Count": String(count) }
    });
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ serverId: string }> }
) {
    const { serverId } = await params;


    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {

        return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1. Get Server Info
    const { data: server } = await supabase
        .from("servers")
        .select("name")
        .eq("id", serverId)
        .eq("user_id", user.id)
        .single();

    if (!server) {

        return new NextResponse("Server not found", { status: 404 });
    }

    // 2. Get All Backups Metadata
    const { data: backups } = await supabase
        .from("workflow_backups")
        .select("*")
        .eq("server_id", serverId)
        .eq("user_id", user.id);

    if (!backups || backups.length === 0) {

        return new NextResponse("No backups found for this server", { status: 404 });
    }



    // 3. Create ZIP
    const zip = new JSZip();
    const folder = zip.folder(server.name.replace(/[^a-z0-9]/gi, '_').toLowerCase());

    // 4. Download each file from Storage and add to ZIP
    for (const backup of backups) {
        const { data, error } = await supabase.storage
            .from("backups")
            .download(backup.storage_path);

        if (error) {
            console.error(`[API Backup] Failed to download ${backup.storage_path}:`, error);
            continue;
        }

        // Filename: workflowName_date.json
        const safeWorkflowName = backup.workflow_name.replace(/[^a-z0-9]/gi, '_');
        const dateStr = new Date(backup.created_at).toISOString().split('T')[0];
        const fileName = `${safeWorkflowName}_${dateStr}_${backup.id.substring(0, 4)}.json`;

        if (folder) {
            folder.file(fileName, await data.arrayBuffer());
        }
    }

    // 5. Generate ZIP
    const content = await zip.generateAsync({ type: "nodebuffer" });


    // 6. Return Response
    return new NextResponse(content as any, {
        headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="${server.name}_backups.zip"`,
        },
    });
}
