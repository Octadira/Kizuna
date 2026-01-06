import { createClient } from "@/utils/supabase/server";
import { SettingsNav } from "@/components/SettingsNav";
import { ActivityLog } from "@/components/ActivityLog";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function ActivityPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Check if user is admin
    const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

    const isAdmin = roleData?.role === 'admin';

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            <div className="flex flex-col md:grid md:grid-cols-[240px_1fr] gap-8 items-start">
                <aside className="w-full">
                    <SettingsNav />
                </aside>

                <main className="space-y-6 w-full min-w-0">
                    <div>
                        <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                            Activity Log
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {isAdmin
                                ? "View all actions performed in the system. Toggle to see your activity only."
                                : "View your recent actions and changes."
                            }
                        </p>
                    </div>

                    <div className="border-t border-border/50 my-4" />

                    <ActivityLog isAdmin={isAdmin} />
                </main>
            </div>
        </div>
    );
}
