import { getWorkflowTemplates, deployWorkflowToServer, getPlugins } from "@/app/actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileJson, Copy, Server, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { DeployTemplateButton } from "@/components/DeployTemplateButton";

export default async function TemplatesPage() {
    const supabase = await createClient();

    // Check if plugin is enabled
    const { data: plugin } = await supabase.from("plugins").select("enabled").eq("key", "workflow_templates").single();

    if (!plugin?.enabled) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
                <FileJson size={64} className="text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold mb-2">Templates Plugin Disabled</h1>
                <p className="text-muted-foreground max-w-md">
                    The Workflow Templates feature is currently disabled. Please enable it in the Settings &gt; Plugins menu to access this feature.
                </p>
            </div>
        );
    }

    const templates = await getWorkflowTemplates();
    const { data: servers } = await supabase.from("servers").select("id, name, url");

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <Copy size={32} />
                    Workflow Templates
                </h1>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                    Manage your saved workflow templates and deploy them to any of your connected servers.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                        <p className="text-muted-foreground">No templates saved yet. Go to a workflow and click "Save as Template".</p>
                    </div>
                ) : (
                    templates.map((template: any) => (
                        <Card key={template.id} className="p-6 flex flex-col gap-4">
                            <div>
                                <h3 className="font-semibold text-lg truncate" title={template.name}>{template.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {template.description || "No description"}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-4 border-t border-border">
                                <FileJson size={14} />
                                <span>{new Date(template.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex gap-2">
                                <DeployTemplateButton
                                    template={template}
                                    servers={servers || []}
                                />
                                {/* Delete button could be added here */}
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
