"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { saveGithubIntegration, removeGithubIntegration } from "@/app/actions";
import { Github, Save, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface GithubSettingsFormProps {
    initialData: {
        owner: string;
        repo: string;
        branch: string;
        hasToken: boolean;
    } | null;
}

export function GithubSettingsForm({ initialData }: GithubSettingsFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setStatus(null);
        try {
            await saveGithubIntegration(formData);
            setStatus({ type: 'success', message: 'GitHub integration saved successfully!' });
            router.refresh();
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    }

    async function handleRemove() {
        if (!confirm("Are you sure you want to disconnect? This will not delete any files from GitHub.")) return;

        setLoading(true);
        try {
            await removeGithubIntegration();
            setStatus({ type: 'success', message: 'Integration removed.' });
            router.refresh();
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            {initialData ? (
                <div className="rounded-md bg-green-500/10 border border-green-500/20 p-4 flex items-center gap-3 text-green-600 dark:text-green-400">
                    <CheckCircle size={20} />
                    <div className="flex-1">
                        <p className="font-medium">Connected to {initialData.owner}/{initialData.repo}</p>
                        <p className="text-xs opacity-80">Branch: {initialData.branch}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleRemove} disabled={loading} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        Disconnect
                    </Button>
                </div>
            ) : (
                <div className="rounded-md bg-blue-500/10 border border-blue-500/20 p-4 flex items-center gap-3 text-blue-600 dark:text-blue-400">
                    <Github size={20} />
                    <p className="font-medium text-sm">Connect a GitHub repository to save backups of your workflows.</p>
                </div>
            )}

            <form action={handleSubmit} className="space-y-4 max-w-lg">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Repo Owner / Org</label>
                        <input
                            name="owner"
                            defaultValue={initialData?.owner}
                            required
                            placeholder="e.g. n8n-io"
                            className="w-full p-2 rounded-md border border-input bg-background"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Repository Name</label>
                        <input
                            name="repo"
                            defaultValue={initialData?.repo}
                            required
                            placeholder="e.g. my-workflows"
                            className="w-full p-2 rounded-md border border-input bg-background"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Branch</label>
                    <input
                        name="branch"
                        defaultValue={initialData?.branch || "main"}
                        required
                        placeholder="main"
                        className="w-full p-2 rounded-md border border-input bg-background"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Personal Access Token (PAT)</label>
                    <input
                        name="token"
                        type="password"
                        required={!initialData?.hasToken}
                        placeholder={initialData?.hasToken ? "Enter new token to update" : "ghp_..."}
                        className="w-full p-2 rounded-md border border-input bg-background"
                    />
                    <p className="text-xs text-muted-foreground">
                        Requires <strong>repo</strong> scope (or public_repo/contents).
                    </p>
                </div>

                {status && (
                    <div className={`p-3 rounded-md text-sm flex items-center gap-2 ${status.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-500'}`}>
                        {status.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                        {status.message}
                    </div>
                )}

                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Saving..." : (
                        <>
                            <Save size={16} className="mr-2" />
                            Save Configuration
                        </>
                    )}
                </Button>
            </form>
        </div>
    );
}
