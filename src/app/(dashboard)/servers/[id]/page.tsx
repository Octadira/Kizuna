import { createClient } from "@/utils/supabase/server";
import { decrypt } from "@/utils/encryption";
import { getN8nWorkflows, getServerStatus, getExecutions } from "@/lib/n8n";
import { WorkflowCard } from "@/components/WorkflowCard";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ExternalLink, Layers, Activity } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ServerAnalytics } from "@/components/ServerAnalytics";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ServerPage({ params }: PageProps) {
    const { id } = await params;
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

    // 2. Fetch Favorites for this server
    const { data: favorites } = await supabase
        .from("favorites")
        .select("workflow_id")
        .eq("server_id", id)
        .eq("user_id", user.id);

    const favoriteIds = new Set(favorites?.map(f => f.workflow_id));

    // 3. Fetch Workflows from n8n
    let workflows: any[] = [];
    let executions: any[] = [];
    let error = null;

    try {
        const apiKey = decrypt(server.api_key);
        const [fetchedWorkflows, fetchedExecutions] = await Promise.all([
            getN8nWorkflows(server.url, apiKey, true),
            getExecutions(server.url, apiKey)
        ]);
        workflows = fetchedWorkflows;
        executions = fetchedExecutions;
    } catch (e: any) {
        error = e.message;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href="/" className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm mb-2 transition-colors">
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </Link>
                    <div className="flex flex-wrap items-center gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                            {server.name}
                        </h1>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${!error
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                            }`}>
                            <div className={`h-2 w-2 rounded-full ${!error ? "bg-green-500" : "bg-red-500"}`} />
                            {!error ? "Online" : "Offline"}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-sm text-muted-foreground">
                        <p className="truncate max-w-[200px] md:max-w-none">{server.url}</p>
                        <span className="hidden md:inline">•</span>
                        <p>{workflows.length} Workflows</p>
                        <span className="hidden md:inline">•</span>
                        <p>{workflows.filter(w => w.active).length} Active</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Link href={`/servers/${server.id}/edit`}>
                        <Button variant="outline" className="gap-2">
                            Edit Server
                        </Button>
                    </Link>
                    <a href={server.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="gap-2">
                            Open n8n <ExternalLink size={16} />
                        </Button>
                    </a>
                </div>
            </div>

            {error ? (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
                    <p className="font-medium">Failed to connect to server</p>
                    <p className="text-sm mt-2 opacity-80">Error: {error}</p>
                </div>
            ) : (
                <div className="space-y-10">
                    {/* Analytics Section */}
                    {executions.length > 0 && (
                        <ServerAnalytics executions={executions} />
                    )}

                    {/* Workflows Section */}
                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                            <Layers size={20} />
                            Workflows ({workflows.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {workflows.map((workflow) => (
                                <WorkflowCard
                                    key={workflow.id}
                                    workflow={workflow}
                                    serverId={server.id}
                                    serverUrl={server.url}
                                    isFavorite={favoriteIds.has(workflow.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
