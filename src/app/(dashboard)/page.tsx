import { createClient } from "@/utils/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Activity, Layers } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { decrypt } from "@/utils/encryption";
import { getServerStatus } from "@/lib/n8n";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: servers } = await supabase
        .from("servers")
        .select("*")
        .order("created_at", { ascending: false });

    // Fetch status for all servers in parallel
    const serversWithStatus = await Promise.all(
        (servers || []).map(async (server) => {
            try {
                const apiKey = decrypt(server.api_key);
                const status = await getServerStatus(server.url, apiKey);
                return { ...server, status };
            } catch (e) {
                return {
                    ...server,
                    status: { online: false, workflowCount: 0, activeWorkflowCount: 0 }
                };
            }
        })
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Servers</h1>
                    <p className="text-muted-foreground mt-1">Manage your n8n instances</p>
                </div>
                <Link href="/servers/new">
                    <Button className="gap-2 shadow-md">
                        <Plus size={18} />
                        Add Server
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {serversWithStatus && serversWithStatus.length > 0 ? (
                    serversWithStatus.map((server) => (
                        <Link key={server.id} href={`/servers/${server.id}`}>
                            <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden border-border bg-card">
                                <div className="absolute top-0 right-0 p-4">
                                    <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border ${server.status.online
                                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                                            : "bg-red-500/10 text-red-500 border-red-500/20"
                                        }`}>
                                        <div className={`h-1.5 w-1.5 rounded-full ${server.status.online ? "bg-green-500" : "bg-red-500"}`} />
                                        {server.status.online ? "Online" : "Offline"}
                                    </div>
                                </div>

                                <div className="space-y-4 p-6">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shadow-sm">
                                        {server.name.substring(0, 2).toUpperCase()}
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                                            {server.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground truncate mt-1">
                                            {server.url}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Layers size={12} /> Workflows
                                            </span>
                                            <span className="font-medium text-foreground">
                                                {server.status.workflowCount}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Activity size={12} /> Active
                                            </span>
                                            <span className="font-medium text-foreground">
                                                {server.status.activeWorkflowCount}
                                            </span>
                                        </div>
                                    </div>

                                    {server.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 pt-2 border-t border-border/50">
                                            {server.description}
                                        </p>
                                    )}
                                </div>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <Card className="col-span-full p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-muted bg-transparent shadow-none">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Plus className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">No servers found</h3>
                        <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
                            Connect your first n8n instance to start managing workflows.
                        </p>
                        <Link href="/servers/new">
                            <Button variant="outline">Connect Server</Button>
                        </Link>
                    </Card>
                )}
            </div>
        </div>
    );
}
