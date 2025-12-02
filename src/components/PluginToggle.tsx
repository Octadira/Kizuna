"use client";

import { useState } from "react";
import { Switch } from "./ui/Switch";
import { togglePlugin } from "@/app/actions";
import { Loader2 } from "lucide-react";

interface PluginToggleProps {
    pluginId: string;
    initialEnabled: boolean;
}

export function PluginToggle({ pluginId, initialEnabled }: PluginToggleProps) {
    const [enabled, setEnabled] = useState(initialEnabled);
    const [loading, setLoading] = useState(false);

    const handleToggle = async (checked: boolean) => {
        setLoading(true);
        // Optimistic update
        setEnabled(checked);
        try {
            await togglePlugin(pluginId, checked);
        } catch (error) {
            console.error("Failed to toggle plugin", error);
            setEnabled(!checked); // Revert
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {loading && <Loader2 className="animate-spin text-muted-foreground" size={14} />}
            <Switch
                checked={enabled}
                onCheckedChange={handleToggle}
                disabled={loading}
                className={enabled ? "data-[state=checked]:bg-green-500" : ""}
            />
        </div>
    );
}
