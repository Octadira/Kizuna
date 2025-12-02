"use client";

import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Star, ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toggleFavorite, toggleWorkflowStatus } from "@/app/actions";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Switch } from "./ui/Switch";

interface WorkflowCardProps {
    workflow: {
        id: string;
        name: string;
        active: boolean;
        tags: { id: string; name: string }[];
        description?: string;
        updatedAt: string;
    };
    serverId: string;
    serverUrl: string;
    isFavorite: boolean;
}

export function WorkflowCard({ workflow, serverId, serverUrl, isFavorite: initialFavorite }: WorkflowCardProps) {
    const [isFavorite, setIsFavorite] = useState(initialFavorite);
    const [isActive, setIsActive] = useState(workflow.active);
    const [loading, setLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);

    const handleToggleFavorite = async () => {
        setLoading(true);
        // Optimistic update
        setIsFavorite(!isFavorite);
        try {
            await toggleFavorite(serverId, workflow.id, workflow.name, isFavorite);
        } catch (error) {
            setIsFavorite(isFavorite); // Revert on error
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (checked: boolean) => {
        setStatusLoading(true);
        // Optimistic update
        setIsActive(checked);
        try {
            await toggleWorkflowStatus(serverId, workflow.id, checked);
        } catch (error) {
            setIsActive(!checked); // Revert
            console.error("Failed to toggle status", error);
        } finally {
            setStatusLoading(false);
        }
    };

    return (
        <Card className="hover:shadow-lg transition-all duration-300 group relative flex flex-col justify-between h-full p-6 bg-card border-border">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={isActive}
                            onCheckedChange={handleToggleActive}
                            disabled={statusLoading}
                            className={cn(isActive ? "data-[state=checked]:bg-green-500" : "")}
                        />
                        <span className={cn("text-xs font-medium uppercase tracking-wider", isActive ? "text-green-500" : "text-muted-foreground")}>
                            {isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleToggleFavorite}
                        disabled={loading}
                        className={cn("hover:bg-muted -mt-1 -mr-2", isFavorite ? "text-yellow-500" : "text-muted-foreground")}
                    >
                        <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
                    </Button>
                </div>

                <h3 className="font-semibold text-lg text-card-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {workflow.name}
                </h3>

                {workflow.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {workflow.description}
                    </p>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                    {workflow.tags.map((tag) => (
                        <span key={tag.id} className="text-xs px-2 py-1 rounded-full bg-secondary/50 text-secondary-foreground border border-secondary">
                            {tag.name}
                        </span>
                    ))}
                </div>

                <p className="text-xs text-muted-foreground mb-4">
                    Updated: {new Date(workflow.updatedAt).toLocaleDateString('en-GB')}
                </p>
            </div>

            <Link
                href={`/servers/${serverId}/workflows/${workflow.id}`}
                className="mt-auto"
            >
                <Button variant="outline" className="w-full gap-2 group-hover:border-primary group-hover:text-primary transition-colors">
                    View Details <ArrowRight size={14} />
                </Button>
            </Link>
        </Card>
    );
}
