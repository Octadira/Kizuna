"use client";

import { updateServer } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useFormStatus } from "react-dom";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" isLoading={pending} className="w-full">
            Save Changes
        </Button>
    );
}

interface EditServerPageProps {
    params: {
        id: string;
        name: string;
        url: string;
        description: string;
    };
}

// We need to fetch data on the server side, so this component will actually be a Server Component wrapper
// But since we are in a file that will be used as a page, we can just export the default async function
// However, passing data from the parent page.tsx is tricky if we want to reuse the form logic.
// Let's make the form a client component and the page a server component.

export default function EditServerForm({ server }: { server: any }) {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Link href={`/servers/${server.id}`} className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm mb-4 transition-colors">
                    <ArrowLeft size={16} />
                    Back to Server Details
                </Link>
                <h1 className="text-3xl font-bold text-foreground">Edit Server</h1>
                <p className="text-muted-foreground mt-1">Update connection details for {server.name}</p>
            </div>

            <Card className="p-6">
                <form action={updateServer} className="space-y-6">
                    <input type="hidden" name="id" value={server.id} />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Server Name</label>
                        <Input name="name" defaultValue={server.name} placeholder="e.g. Production Server" required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Server URL</label>
                        <Input name="url" type="url" defaultValue={server.url} placeholder="https://n8n.yourdomain.com" required />
                        <p className="text-xs text-muted-foreground">The base URL of your n8n instance</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">API Key</label>
                        <Input name="apiKey" type="password" placeholder="Leave blank to keep existing key" />
                        <p className="text-xs text-muted-foreground">
                            Enter a new key only if you want to change it.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Description (Optional)</label>
                        <Input name="description" defaultValue={server.description || ""} placeholder="Main automation server..." />
                    </div>

                    <div className="pt-4">
                        <SubmitButton />
                    </div>
                </form>
            </Card>
        </div>
    );
}
