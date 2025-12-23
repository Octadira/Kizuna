import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ServerGrid } from "@/components/ServerGrid";

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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Servers</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage your n8n instances</p>
                </div>
                <Link href="/servers/new">
                    <Button className="gap-2 shadow-md h-9 px-4 text-sm">
                        <Plus size={16} />
                        Add Server
                    </Button>
                </Link>
            </div>

            <ServerGrid servers={servers || []} />
        </div>
    );
}

