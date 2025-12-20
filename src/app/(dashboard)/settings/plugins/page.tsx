import { getPlugins } from "@/app/actions";
import { SettingsNav } from "@/components/SettingsNav";
import { PluginsList } from "@/components/PluginsList";

export default async function PluginsPage() {
    // Force dynamic rendering to ensure fresh data
    const plugins = await getPlugins();

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
                            Plugins & Extensions
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Manage additional features and modules for your Kizuna instance.
                        </p>
                    </div>

                    <div className="border-t border-border/50 my-4" />

                    <PluginsList plugins={plugins || []} />
                </main>
            </div>
        </div>
    );
}


