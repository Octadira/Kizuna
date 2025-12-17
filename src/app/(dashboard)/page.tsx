import { createClient } from "@/utils/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ServerCard } from "@/components/ServerCard";

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
                {servers && servers.length > 0 ? (
                    servers.map((server, index) => (
                        <ServerCard key={server.id} server={server} index={index} />
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
