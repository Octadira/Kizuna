import { createClient } from "@/utils/supabase/server";
import { decrypt } from "@/utils/encryption";
import { getN8nWorkflow, getExecutions } from "@/lib/n8n";
import { WorkflowDetails } from "@/components/WorkflowDetails";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string; workflowId: string }>;
}

export default async function WorkflowPage({ params }: PageProps) {
    const { id, workflowId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // 1. Fetch Server Details
    const { data: server } = await supabase
        .from("servers")
        .select("*")
        .eq("id", id)
        .single();

    if (!server) notFound();

    // 2. Fetch Workflow Details, Executions, Notes, Backups, Plugins, and Servers (for cloning)
    let workflow = null;
    let executions: any[] = [];
    let note = "";
    let backups: any[] = [];
    let features: any = {};
    let servers: any[] = [];
    let error = null;

    try {
        const apiKey = decrypt(server.api_key);

        // Parallel fetching for performance
        const [fetchedWorkflow, fetchedExecutions, noteData, backupsData, pluginsData, serversData] = await Promise.all([
            getN8nWorkflow(server.url, apiKey, workflowId),
            getExecutions(server.url, apiKey, 20, workflowId),
            supabase.from("workflow_notes").select("note").eq("server_id", id).eq("workflow_id", workflowId).single(),
            supabase.from("workflow_backups").select("*").eq("server_id", id).eq("workflow_id", workflowId).order("created_at", { ascending: false }),
            supabase.from("plugins").select("key, enabled"),
            supabase.from("servers").select("id, name, url")
        ]);

        workflow = fetchedWorkflow;
        executions = fetchedExecutions;
        note = noteData.data?.note || "";
        backups = backupsData.data || [];
        servers = serversData.data || [];

        features = (pluginsData.data || []).reduce((acc: any, p: any) => {
            acc[p.key] = p.enabled;
            return acc;
        }, {});


    } catch (e: any) {
        error = e.message;
    }

    if (!workflow) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Workflow Not Found</h1>
                <p className="text-muted-foreground mb-4">Could not fetch workflow details. It might have been deleted or the server is unreachable.</p>
                <Link href={`/servers/${id}`} className="text-primary hover:underline">
                    Back to Server
                </Link>
            </div>
        );
    }

    // Create a lightweight version of the workflow for the client component
    // This prevents sending the huge JSON payload (nodes, connections) in the initial HTML
    const lightweightWorkflow = {
        ...workflow,
        nodes: workflow.nodes.filter((n: any) => n.type === "n8n-nodes-base.webhook"), // Only keep webhook nodes for the helper
        connections: {}, // Remove connections
        // We keep metadata like id, name, active, tags, createdAt, updatedAt, description
    };

    return (
        <div className="space-y-8">
            <div>
                <Link href={`/servers/${id}`} className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm mb-4 transition-colors">
                    <ArrowLeft size={16} />
                    Back to Server
                </Link>
                <h1 className="text-3xl font-bold text-foreground">{workflow.name}</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                    {workflow.description || "No description provided."}
                </p>
            </div>

            <WorkflowDetails
                workflow={lightweightWorkflow}
                executions={executions}
                serverId={server.id}
                serverUrl={server.url}
                initialNote={note}
                backups={backups}
                features={features}
                servers={servers}
            />
        </div>
    );
}
