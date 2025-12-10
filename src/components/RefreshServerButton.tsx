"use client";

import { Button } from "@/components/ui/Button";
import { RefreshCw } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";
import { useState, useTransition } from "react";
import { refreshServerStatus } from "@/app/actions";

interface RefreshServerButtonProps {
    serverId: string;
    className?: string;
    onRefresh?: () => void;
}

export function RefreshServerButton({ serverId, className, onRefresh }: RefreshServerButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [rotated, setRotated] = useState(false);

    const handleRefresh = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setRotated(true);
        // Reset rotation animation class after it completes
        setTimeout(() => setRotated(false), 1000);

        startTransition(async () => {
            await refreshServerStatus(serverId);
            if (onRefresh) onRefresh();
        });
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", className)}
                        onClick={handleRefresh}
                        disabled={isPending}
                    >
                        <RefreshCw
                            size={14}
                            className={cn(
                                isPending || rotated ? "animate-spin" : ""
                            )}
                        />
                        <span className="sr-only">Force Refresh</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Updated every 60s. Click to force refresh now.</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
