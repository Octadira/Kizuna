import { createClient } from "@/utils/supabase/server";
import { GithubSettingsForm } from "@/components/GithubSettingsForm";
import { SettingsNav } from "@/components/SettingsNav";

export default async function GithubSettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: integration } = await supabase
        .from("github_integrations")
        .select("owner, repo, branch")
        .eq("user_id", user.id)
        .single();

    const initialData = integration ? {
        owner: integration.owner,
        repo: integration.repo,
        branch: integration.branch || "main",
        hasToken: true
    } : null;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Settings</h1>

            <div className="md:grid md:grid-cols-4 md:gap-8">
                <div className="md:col-span-1">
                    <SettingsNav />
                </div>
                <div className="md:col-span-3 space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-1">GitHub Integration</h2>
                        <p className="text-sm text-muted-foreground">
                            Configure a repository to sync your workflows.
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6">
                        <GithubSettingsForm initialData={initialData} />
                    </div>
                </div>
            </div>
        </div>
    );
}
