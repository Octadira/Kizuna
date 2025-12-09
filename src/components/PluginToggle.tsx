"use client";
import { useState } from "react";
import { Switch } from "./ui/Switch";
import { togglePlugin } from "@/app/actions";
import { Loader2, AlertCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "./ui/Dialog";
import { Button } from "./ui/Button";

interface PluginToggleProps {
    pluginId: string;
    pluginKey: string;
    initialEnabled: boolean;
}

export function PluginToggle({ pluginId, pluginKey, initialEnabled }: PluginToggleProps) {
    const [enabled, setEnabled] = useState(initialEnabled);
    const [loading, setLoading] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleToggle = async (checked: boolean) => {
        setLoading(true);
        // Optimistic update
        setEnabled(checked);
        try {
            await togglePlugin(pluginId, checked);

            // For visual plugins, force a reload to apply changes immediately
            if (['theme_switcher', 'animated_background'].includes(pluginKey)) {
                // Short timeout to ensure server processing is effectively done
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }

        } catch (error: any) {
            console.error("Failed to toggle plugin", error);
            setEnabled(!checked); // Revert

            // Check for specific error messages or default to generic
            if (error.message.includes("Forbidden") || error.message.includes("Unauthorized")) {
                setErrorMessage("You do not have permission to perform this action. Only administrators can manage plugins.");
            } else {
                setErrorMessage(error.message || "An unexpected error occurred while updating the plugin.");
            }
            setErrorModalOpen(true);
        } finally {
            if (!['theme_switcher', 'animated_background'].includes(pluginKey)) {
                setLoading(false);
            }
        }
    };

    return (
        <>
            <div className="flex items-center gap-2">
                {loading && <Loader2 className="animate-spin text-muted-foreground" size={14} />}
                <Switch
                    checked={enabled}
                    onCheckedChange={handleToggle}
                    disabled={loading}
                    className={enabled ? "data-[state=checked]:bg-green-500" : ""}
                />
            </div>

            <Dialog open={errorModalOpen} onOpenChange={setErrorModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle size={20} />
                            Access Denied
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            {errorMessage}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setErrorModalOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
