"use client";

import { addServer } from "@/app/actions";
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
            Add Server
        </Button>
    );
}

export default function NewServerPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Link href="/" className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm mb-4 transition-colors">
                    <ArrowLeft size={16} />
                    Back to Servers
                </Link>
                <h1 className="text-3xl font-bold text-foreground">Connect New Server</h1>
                <p className="text-muted-foreground mt-1">Add a new n8n instance to your dashboard</p>
            </div>

            <Card className="p-6">
                <form action={addServer} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Server Name</label>
                        <Input name="name" placeholder="e.g. Production Server" required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Server URL</label>
                        <Input name="url" type="url" placeholder="https://n8n.yourdomain.com" required />
                        <p className="text-xs text-muted-foreground">The base URL of your n8n instance</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">API Key</label>
                        <Input name="apiKey" type="password" placeholder="n8n_api_..." required />
                        <p className="text-xs text-muted-foreground">
                            Found in n8n Settings {'>'} API. Stored securely using AES-256 encryption.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Description (Optional)</label>
                        <Input name="description" placeholder="Main automation server..." />
                    </div>

                    <div className="pt-4">
                        <SubmitButton />
                    </div>
                </form>
            </Card>
        </div>
    );
}
