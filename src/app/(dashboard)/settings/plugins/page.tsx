import { getPlugins, togglePlugin } from "@/app/actions";
import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { Puzzle, Box } from "lucide-react";
import { PluginToggle } from "@/components/PluginToggle";

export default async function PluginsPage() {
    const plugins = await getPlugins();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <Puzzle size={32} />
                    Plugins & Extensions
                </h1>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                    Manage additional features and modules for your n8Kizuna instance. Enable only what you need to keep the interface clean.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    );
}
