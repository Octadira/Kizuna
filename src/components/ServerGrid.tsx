"use client";

import { useState, useMemo, useEffect } from "react";
import { ServerCard } from "@/components/ServerCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { Plus, Search, X, Server } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Server {
    id: string;
    name: string;
    url: string;
    description?: string;
    created_at: string;
}

interface ServerGridProps {
    servers: Server[];
}

const SERVERS_PER_PAGE = 6;

export function ServerGrid({ servers }: ServerGridProps) {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Memoize filtered servers for performance
    const filteredServers = useMemo(() => {
        if (!search.trim()) return servers;

        const searchLower = search.toLowerCase();
        return servers.filter((server) =>
            server.name.toLowerCase().includes(searchLower) ||
            server.url.toLowerCase().includes(searchLower) ||
            (server.description && server.description.toLowerCase().includes(searchLower))
        );
    }, [servers, search]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredServers.length / SERVERS_PER_PAGE);
    const paginatedServers = useMemo(() => {
        const startIndex = (currentPage - 1) * SERVERS_PER_PAGE;
        return filteredServers.slice(startIndex, startIndex + SERVERS_PER_PAGE);
    }, [filteredServers, currentPage]);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const handleSearchChange = (value: string) => {
        setSearch(value);
    };

    // No servers at all
    if (servers.length === 0) {
        return (
            <Card className="col-span-full p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-muted bg-transparent shadow-none">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No servers found</h3>
                <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
                    Connect your first n8n instance to start managing workflows.
                </p>
                <Link href="/servers/new">
                    <Button variant="outline">Connect Server</Button>
                </Link>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Server size={16} />
                    <span>
                        <span className="font-medium text-foreground">{filteredServers.length}</span>
                        {filteredServers.length !== servers.length && (
                            <span className="text-muted-foreground"> of {servers.length}</span>
                        )}
                        {" "}server{filteredServers.length !== 1 ? "s" : ""}
                    </span>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                        placeholder="Search servers..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-9 h-10 bg-background"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Grid or Empty State */}
            {filteredServers.length === 0 ? (
                <div className="text-center py-16 border border-dashed rounded-lg bg-muted/10">
                    <div className="flex justify-center mb-4">
                        <Search size={48} className="text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">No servers found</h3>
                    <p className="text-muted-foreground mt-1">
                        No servers match &quot;{search}&quot;
                    </p>
                    <Button
                        variant="link"
                        onClick={() => setSearch("")}
                        className="mt-2"
                    >
                        Clear search
                    </Button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginatedServers.map((server, index) => (
                            <ServerCard key={server.id} server={server} index={index} />
                        ))}
                    </div>

                    {/* Pagination */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredServers.length}
                        itemsPerPage={SERVERS_PER_PAGE}
                    />
                </>
            )}
        </div>
    );
}
