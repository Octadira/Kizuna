import { getUsers } from "@/app/admin/actions";
import { UsersManager } from "@/components/UsersManager";
import { SettingsNav } from "@/components/SettingsNav";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
    const { users, error } = await getUsers();

    if (error === "Unauthorized access") {
        redirect("/settings/profile");
    }

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
                            User Management
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Manage team members and their access levels.
                        </p>
                    </div>

                    <div className="border-t border-border/50 my-4" />

                    {error ? (
                        <div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                            Error loading users: {error}
                        </div>
                    ) : (
                        <UsersManager initialUsers={users || []} />
                    )}
                </main>
            </div>
        </div>
    );
}
