"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { Box, Search, X, Puzzle } from "lucide-react";
import { PluginToggle } from "@/components/PluginToggle";
import { Button } from "@/components/ui/Button";

interface Plugin {
    id: string;
    key: string;
    name: string;
    description?: string;
    enabled: boolean;
    version?: string;
    created_at?: string;
}

interface PluginsListProps {
    plugins: Plugin[];
}

const PLUGINS_PER_PAGE = 6;

export function PluginsList({ plugins }: PluginsListProps) {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Memoize filtered plugins
    const filteredPlugins = useMemo(() => {
        if (!search.trim()) return plugins;

        const searchLower = search.toLowerCase();
        return plugins.filter((plugin) =>
            plugin.name.toLowerCase().includes(searchLower) ||
            plugin.key.toLowerCase().includes(searchLower) ||
            (plugin.description && plugin.description.toLowerCase().includes(searchLower))
        );
    }, [plugins, search]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredPlugins.length / PLUGINS_PER_PAGE);
    const paginatedPlugins = useMemo(() => {
        const startIndex = (currentPage - 1) * PLUGINS_PER_PAGE;
        return filteredPlugins.slice(startIndex, startIndex + PLUGINS_PER_PAGE);
    }, [filteredPlugins, currentPage]);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Puzzle size={16} />
                    <span>
                        <span className="font-medium text-foreground">{filteredPlugins.length}</span>
                        {filteredPlugins.length !== plugins.length && (
                            <span className="text-muted-foreground"> of {plugins.length}</span>
                        )}
                        {" "}plugin{filteredPlugins.length !== 1 ? "s" : ""}
                    </span>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                        placeholder="Search plugins..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
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
            {filteredPlugins.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                    <div className="flex justify-center mb-4">
                        {plugins.length === 0 ? (
                            <Box className="text-muted-foreground" size={48} />
                        ) : (
                            <Search className="text-muted-foreground" size={48} />
                        )}
                    </div>
                    <h3 className="text-lg font-medium text-foreground">
                        {plugins.length === 0 ? "No Plugins Available" : "No plugins found"}
                    </h3>
                    <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                        {plugins.length === 0
                            ? "There are no plugins installed in the system yet."
                            : `No plugins match "${search}"`
                        }
                    </p>
                    {plugins.length > 0 && (
                        <Button
                            variant="link"
                            onClick={() => setSearch("")}
                            className="mt-2"
                        >
                            Clear search
                        </Button>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4">
                        {paginatedPlugins.map((plugin) => (
                            <Card key={plugin.id} className="p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between transition-all hover:shadow-md border-border/60">
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 min-w-[2.5rem] rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <Puzzle size={20} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-base flex items-center gap-2">
                                            {plugin.name}
                                            <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground border">
                                                {plugin.key}
                                            </span>
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {plugin.description}
                                        </p>
                                        <div className="flex items-center gap-3 pt-1">
                                            <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                                                v{plugin.version}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-4 sm:pt-0 mt-2 sm:mt-0 px-1 sm:px-0">
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`text-xs font-medium ${plugin.enabled ? "text-green-500" : "text-muted-foreground"}`}>
                                            {plugin.enabled ? "Active" : "Inactive"}
                                        </span>
                                        <PluginToggle
                                            pluginId={plugin.id}
                                            pluginKey={plugin.key}
                                            initialEnabled={plugin.enabled}
                                        />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredPlugins.length}
                        itemsPerPage={PLUGINS_PER_PAGE}
                    />
                </>
            )}
        </div>
    );
}
