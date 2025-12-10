"use client";

import { ServerCard } from "@/components/ServerCard";
import { RefreshServerButton } from "@/components/RefreshServerButton";

interface Server {
    id: string;
    name: string;
    url: string;
    description?: string;
    // ... other props
}

interface DashboardServerGridProps {
    servers: Server[];
}

export function DashboardServerGrid({ servers }: DashboardServerGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servers.map((server) => (
                <div key={server.id} className="h-full relative group">
                    {/* 
                       Wrap ServerCard and inject status.
                       We also place the Refresh button absolutely positioned ON TOP of the card 
                       so it's accessible without clicking into the server.
                     */}
                    <div className="absolute top-4 right-4 z-40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <RefreshServerButton serverId={server.id} />
                    </div>

                    <ServerCard
                        server={server}
                    />
                </div>
            ))}
        </div>
    );
}
