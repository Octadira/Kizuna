"use client";

import { Card } from "@/components/ui/Card";
import { Activity, Layers, Clock, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchServerStatus } from "@/app/actions";
import { cn } from "@/lib/utils";
import { RefreshServerButton } from "./RefreshServerButton";

interface ServerCardProps {
    server: {
        id: string;
        name: string;
        url: string;
        description?: string;
    };
}

export interface ServerStatus {
    online: boolean;
    workflowCount: number;
    activeWorkflowCount: number;
    version?: string;
    updateAvailable?: boolean;
}

export function ServerCard({ server }: ServerCardProps) {
    const [status, setStatus] = useState<ServerStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [latency, setLatency] = useState<number | null>(null);
    const [error, setError] = useState(false);

    const checkStatus = async () => {
        setIsLoading(true);
        const startTime = performance.now();
        try {
            const result = await fetchServerStatus(server.id);
            const endTime = performance.now();

            setStatus(result);
            setLatency(Math.round(endTime - startTime));
            setIsLoading(false);
            setError(false);
        } catch (e) {
            console.error("Failed to fetch status", e);
            setError(true);
            setStatus({ online: false, workflowCount: 0, activeWorkflowCount: 0 });
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkStatus();
    }, [server.id]);

    const handleRefresh = () => {
        checkStatus();
    };

    // Use dummy values for layout while loading to prevent layout shift
    const displayStatus = status || { online: false, workflowCount: 0, activeWorkflowCount: 0 };

    return (
        <Card className="h-full relative overflow-hidden border-border bg-card hover:shadow-lg transition-all duration-300 group">
            <Link href={`/servers/${server.id}`} className="block h-full">

                {/* 1. Loading State Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/20 backdrop-blur-[2px] transition-all duration-300">
                        <div className="bg-background/80 p-3 rounded-full shadow-lg border border-border animate-in fade-in zoom-in duration-300">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    </div>
                )}

                {/* 2. Status & Latency Badges (Top Right) */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                    {/* Latency Badge - Only show when loaded */}
                    {!isLoading && !error && latency !== null && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium border bg-secondary/50 text-secondary-foreground border-border animate-in fade-in slide-in-from-top-2 duration-500">
                            <Clock size={10} />
                            {latency}ms
                        </div>
                    )}

                    {/* Status Badge */}
                    {!isLoading ? (
                        <div className={cn(
                            "flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border bg-background/80 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-500 delay-75",
                            displayStatus.online ? "text-green-500 border-green-500/20" : "text-red-500 border-red-500/20"
                        )}>
                            <div className={cn("h-1.5 w-1.5 rounded-full", displayStatus.online ? "bg-green-500" : "bg-red-500")} />
                            {displayStatus.online ? "Online" : "Offline"}
                        </div>
                    ) : (
                        // Placeholder badge while loading so layout matches
                        <div className="h-6 w-16 bg-muted/50 rounded-full animate-pulse" />
                    )}
                </div>

                <div className={cn("space-y-4 p-6 transition-opacity duration-300", isLoading ? "opacity-40" : "opacity-100")}>
                    {/* Icon */}
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shadow-sm group-hover:scale-105 transition-transform duration-300">
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
                            <span className={cn("font-medium text-foreground", isLoading && "bg-muted/50 text-transparent rounded animate-pulse w-8")}>
                                {displayStatus.workflowCount}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Activity size={12} /> Active
                            </span>
                            <span className={cn("font-medium text-foreground", isLoading && "bg-muted/50 text-transparent rounded animate-pulse w-8")}>
                                {displayStatus.activeWorkflowCount}
                            </span>
                        </div>
                    </div>

                    {server.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 pt-2 border-t border-border/50">
                            {server.description}
                        </p>
                    )}
                </div>
            </Link>

            {/* Refresh Button - Bottom Right, Absolute, over everything else, visible on hover */}
            <div className="absolute bottom-4 right-4 z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <RefreshServerButton
                    serverId={server.id}
                    onRefresh={handleRefresh}
                    className="bg-background border border-border shadow-md hover:bg-accent"
                />
            </div>
        </Card>
    );
}
