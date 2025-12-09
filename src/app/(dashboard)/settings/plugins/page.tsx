import { getPlugins, togglePlugin } from "@/app/actions";
import { Card } from "@/components/ui/Card";
import { Puzzle, Box } from "lucide-react";
import { PluginToggle } from "@/components/PluginToggle";
import { SettingsNav } from "@/components/SettingsNav";

export default async function PluginsPage() {
    const plugins = await getPlugins();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Settings</h1>

            <div className="md:grid md:grid-cols-4 md:gap-8">
                <div className="md:col-span-1">
                    <SettingsNav />
                </div>
                <div className="md:col-span-3 space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                            Plugins & Extensions
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Manage additional features and modules for your Kizuna instance.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {plugins.length === 0 ? (
                            <div className="col-span-full text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                                <Box className="mx-auto text-muted-foreground mb-4" size={48} />
                                <h3 className="text-lg font-medium">No Plugins Available</h3>
                                <p className="text-muted-foreground">There are no plugins installed in the system yet.</p>
                            </div>
                        ) : (
                            plugins.map((plugin: any) => (
                                <Card key={plugin.id} className="p-6 flex flex-col justify-between gap-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h3 className="font-semibold text-lg">{plugin.name}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {plugin.description}
                                            </p>
                                        </div>
                                        <PluginToggle
                                            pluginId={plugin.id}
                                            pluginKey={plugin.key}
                                            initialEnabled={plugin.enabled}
                                        />
                                    </div>
                                    <div className="pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                                        <span>Version: {plugin.version}</span>
                                        <span className="font-mono bg-muted px-2 py-0.5 rounded">{plugin.key}</span>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

