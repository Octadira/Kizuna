"use client";

import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Star, ArrowRight } from "lucide-react";
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
        archived?: boolean;
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

    const isArchived = workflow.archived === true || (workflow.tags && workflow.tags.some(t => t.name.toLowerCase() === "archived"));

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
        <Card className="hover:shadow-lg transition-all duration-300 group relative flex flex-col justify-between h-full p-5 bg-card border-border">
            <div>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        {isArchived ? (
                            <span className="px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-wider">
                                Archived
                            </span>
                        ) : (
                            <>
                                <Switch
                                    checked={isActive}
                                    onCheckedChange={handleToggleActive}
                                    disabled={statusLoading}
                                    className={cn(isActive ? "data-[state=checked]:bg-green-500" : "")}
                                />
                                <span className={cn("text-xs font-medium uppercase tracking-wider", isActive ? "text-green-500" : "text-muted-foreground")}>
                                    {isActive ? "Published" : "Unpublished"}
                                </span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleToggleFavorite}
                            disabled={loading}
                            className={cn("hover:bg-muted", isFavorite ? "text-yellow-500" : "text-muted-foreground")}
                        >
                            <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
                        </Button>
                    </div>
                </div>

                <h3 className="font-semibold text-base text-card-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
                    {workflow.name}
                </h3>

                {workflow.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {workflow.description}
                    </p>
                )}

                <div className="flex flex-wrap gap-1.5 mb-3">
                    {workflow.tags.map((tag) => (
                        <span key={tag.id} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/50 text-secondary-foreground border border-secondary">
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
