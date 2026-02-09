import { createClient } from "@/utils/supabase/server";
import { ServerConnectionLogs } from "@/components/ServerConnectionLogs";
import { Terminal } from "lucide-react";

export default async function ServerLogsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch user's servers for the filter dropdown (if needed in future)
    const { data: servers } = await supabase
        .from("servers")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name");

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <Terminal className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold text-foreground">Server Connection Logs</h1>
                </div>
                <p className="text-sm text-muted-foreground">
                    Monitor all connection attempts to your n8n servers. Use this to troubleshoot connectivity issues and track server health.
                </p>
            </div>

            {/* Server Selector (for future enhancement) */}
            {servers && servers.length > 1 && (
                <div className="bg-card border border-border rounded-lg p-4">
                    <label className="text-sm font-medium text-foreground mb-2 block">
                        Filter by Server
                    </label>
                    <p className="text-xs text-muted-foreground">
                        To view logs for a specific server, visit the server's detail page and open the "Connection Logs" tab.
                    </p>
                </div>
            )}

            <div className="bg-card border border-border rounded-lg p-6">
                <ServerConnectionLogs />
            </div>
        </div>
    );
}
