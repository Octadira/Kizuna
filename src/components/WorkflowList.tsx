"use client";

import { useState } from "react";
import { WorkflowCard } from "./WorkflowCard";
import { Input } from "./ui/Input";
import { Search, X, LayoutGrid, CheckCircle2, Archive } from "lucide-react";
import { Button } from "./ui/Button";
import { cn } from "@/lib/utils";

interface WorkflowListProps {
    workflows: any[];
    serverId: string;
    serverUrl: string;
    favoriteIds: Set<string>;
}

type Tab = "active" | "all" | "inactive";

export function WorkflowList({ workflows, serverId, serverUrl, favoriteIds }: WorkflowListProps) {
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<Tab>("active");

    const filteredWorkflows = workflows.filter((workflow) => {
        const matchesSearch = workflow.name.toLowerCase().includes(search.toLowerCase()) ||
            (workflow.tags && workflow.tags.some((t: any) => t.name.toLowerCase().includes(search.toLowerCase())));

        const isArchived = workflow.archived === true || (workflow.tags && workflow.tags.some((t: any) => t.name.toLowerCase() === "archived"));

        let matchesTab = false;
        if (activeTab === "active") {
            matchesTab = workflow.active && !isArchived;
        } else if (activeTab === "inactive") {
            matchesTab = !workflow.active || isArchived;
        } else {
            // All tab
            matchesTab = true;
        }

        return matchesSearch && matchesTab;
    });

    // Sort: Favorites first, then Name
    filteredWorkflows.sort((a, b) => {
        const aFav = favoriteIds.has(a.id);
        const bFav = favoriteIds.has(b.id);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return a.name.localeCompare(b.name);
    });

    const activeCount = workflows.filter(w => w.active).length;
    const inactiveCount = workflows.length - activeCount;

    return (
        <div className="space-y-6">
            {/* Search and Tabs Header */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

                {/* Tabs */}
                <div className="flex p-1 bg-muted/50 rounded-lg border border-border w-full md:w-auto overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("active")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap",
                            activeTab === "active"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                    >
                        <CheckCircle2 size={16} className={activeTab === "active" ? "text-green-500" : ""} />
                        Active
                        <span className="bg-muted-foreground/10 px-1.5 py-0.5 rounded text-xs ml-1">{activeCount}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("inactive")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap",
                            activeTab === "inactive"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                    >
                        <Archive size={16} className={activeTab === "inactive" ? "text-orange-500" : ""} />
                        Archived / Inactive
                        <span className="bg-muted-foreground/10 px-1.5 py-0.5 rounded text-xs ml-1">{inactiveCount}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("all")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap",
                            activeTab === "all"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                    >
                        <LayoutGrid size={16} />
                        All
                        <span className="bg-muted-foreground/10 px-1.5 py-0.5 rounded text-xs ml-1">{workflows.length}</span>
                    </button>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-10 bg-background"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Grid */}
            {filteredWorkflows.length === 0 ? (
                <div className="text-center py-16 border border-dashed rounded-lg bg-muted/10">
                    <div className="flex justify-center mb-4">
                        {activeTab === "active" ? <CheckCircle2 size={48} className="text-muted-foreground/50" /> :
                            activeTab === "inactive" ? <Archive size={48} className="text-muted-foreground/50" /> :
                                <Search size={48} className="text-muted-foreground/50" />}
                    </div>
                    <h3 className="text-lg font-medium text-foreground">No workflows found</h3>
                    <p className="text-muted-foreground mt-1">
                        {search ? `No matches for "${search}"` : `No ${activeTab} workflows available.`}
                    </p>
                    {search && (
                        <Button
                            variant="link"
                            onClick={() => { setSearch(""); setActiveTab("all"); }}
                            className="mt-2"
                        >
                            Clear search
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredWorkflows.map((workflow) => (
                        <div key={workflow.id} className={cn("transition-opacity duration-300", !workflow.active && activeTab === 'all' ? "opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0" : "")}>
                            <WorkflowCard
                                workflow={workflow}
                                serverId={serverId}
                                serverUrl={serverUrl}
                                isFavorite={favoriteIds.has(workflow.id)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
