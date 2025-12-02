"use client";

import { useState } from "react";
import { WorkflowCard } from "./WorkflowCard";
import { Input } from "./ui/Input";
import { Search, Filter, X } from "lucide-react";
import { Button } from "./ui/Button";

interface WorkflowListProps {
    workflows: any[];
    serverId: string;
    serverUrl: string;
    favoriteIds: Set<string>;
}

export function WorkflowList({ workflows, serverId, serverUrl, favoriteIds }: WorkflowListProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

    const filteredWorkflows = workflows.filter((workflow) => {
        const matchesSearch = workflow.name.toLowerCase().includes(search.toLowerCase()) ||
            (workflow.tags && workflow.tags.some((t: any) => t.name.toLowerCase().includes(search.toLowerCase())));

        const matchesStatus = statusFilter === "all"
            ? true
            : statusFilter === "active"
                ? workflow.active
                : !workflow.active;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                        placeholder="Search workflows by name or tag..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="h-10 pl-3 pr-8 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none cursor-pointer min-w-[140px]"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
                Showing {filteredWorkflows.length} of {workflows.length} workflows
            </div>

            {/* Grid */}
            {filteredWorkflows.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-lg">
                    <p className="text-muted-foreground">No workflows found matching your criteria.</p>
                    <Button
                        variant="link"
                        onClick={() => { setSearch(""); setStatusFilter("all"); }}
                        className="mt-2"
                    >
                        Clear filters
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredWorkflows.map((workflow) => (
                        <WorkflowCard
                            key={workflow.id}
                            workflow={workflow}
                            serverId={serverId}
                            serverUrl={serverUrl}
                            isFavorite={favoriteIds.has(workflow.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
