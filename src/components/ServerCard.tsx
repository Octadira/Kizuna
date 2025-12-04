"use client";

import { Card } from "@/components/ui/Card";
import { Activity, Layers } from "lucide-react";
import Link from "next/link";

interface ServerCardProps {
    server: {
        id: string;
        name: string;
        url: string;
        description?: string;
        status: {
            online: boolean;
            workflowCount: number;
            activeWorkflowCount: number;
        };
    };
}

export function ServerCard({ server }: ServerCardProps) {
    return (
        <Link href={`/servers/${server.id}`} className="block h-full">
            <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden border-border bg-card">
                <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                    <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border bg-background/80 backdrop-blur-sm ${server.status.online
                        ? "text-green-500 border-green-500/20"
                        : "text-red-500 border-red-500/20"
                        }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${server.status.online ? "bg-green-500" : "bg-red-500"}`} />
                        {server.status.online ? "Online" : "Offline"}
                    </div>
                </div>

                <div className="space-y-4 p-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shadow-sm">
                        {server.name.substring(0, 2).toUpperCase()}
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                            {server.name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                            {server.url}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Layers size={12} /> Workflows
                            </span>
                            <span className="font-medium text-foreground">
                                {server.status.workflowCount}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Activity size={12} /> Active
                            </span>
                            <span className="font-medium text-foreground">
                                {server.status.activeWorkflowCount}
                            </span>
                        </div>
                    </div>

                    {server.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 pt-2 border-t border-border/50">
                            {server.description}
                        </p>
                    )}
                </div>
            </Card>
        </Link>
    );
}
