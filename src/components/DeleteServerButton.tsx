"use client";

import { Button } from "@/components/ui/Button";
import { Trash2, Activity, Download } from "lucide-react";
import { deleteServer } from "@/app/actions";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/Dialog";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface DeleteServerButtonProps {
    serverId: string;
    serverName: string;
}

export function DeleteServerButton({ serverId, serverName }: DeleteServerButtonProps) {
    const [status, setStatus] = useState<"idle" | "checking" | "backing_up" | "deleting">("idle");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [hasBackups, setHasBackups] = useState(false);
    const [backupChecked, setBackupChecked] = useState(true);
    const router = useRouter();

    // Check if server has backups when dialog opens
    useEffect(() => {
        if (isDialogOpen) {
            checkForBackups();
        }
    }, [isDialogOpen]);

    const checkForBackups = async () => {
        setStatus("checking");
        try {
            const response = await fetch(`/api/backup/${serverId}`, { method: "HEAD" });
            setHasBackups(response.ok);
        } catch {
            setHasBackups(false);
        }
        setStatus("idle");
    };

    const handleDownloadBackup = async (): Promise<boolean> => {
        try {
            const response = await fetch(`/api/backup/${serverId}`);
            if (!response.ok) {
                // No backups to download, continue
                return true; // Continue with delete
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${serverName}_backups.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Wait a bit to ensure download starts
            await new Promise(resolve => setTimeout(resolve, 1500));
            return true;
        } catch (error) {
            console.error("Backup download failed:", error);
            return window.confirm("Backup download failed! Do you want to proceed with deletion anyway?");
        }
    };

    const handleDelete = async () => {
        // Step 1: Download backup if requested and available
        if (backupChecked && hasBackups) {
            setStatus("backing_up");
            const proceedWithDelete = await handleDownloadBackup();
            if (!proceedWithDelete) {
                setStatus("idle");
                return;
            }
        }

        // Step 2: Delete server
        setStatus("deleting");
        try {
            await deleteServer(serverId);
            setIsDialogOpen(false);
            router.push("/");
            router.refresh();
        } catch (error) {
            console.error("Failed to delete server", error);
            alert("Failed to delete server: " + (error as Error).message);
            setStatus("idle");
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="danger" className="gap-2">
                    <Trash2 size={16} />
                    Delete Server
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Server</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>{serverName}</strong>? This action cannot be undone and will remove all associated data.
                    </DialogDescription>
                </DialogHeader>

                {status === "checking" ? (
                    <div className="flex items-center gap-2 py-4 text-muted-foreground">
                        <Activity className="h-4 w-4 animate-spin" />
                        Checking for backups...
                    </div>
                ) : hasBackups ? (
                    <div className="flex items-center space-x-3 py-4 bg-muted/50 p-3 rounded-md border border-border/50">
                        <input
                            type="checkbox"
                            id="backup"
                            checked={backupChecked}
                            onChange={(e) => setBackupChecked(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        />
                        <label
                            htmlFor="backup"
                            className="text-sm font-medium leading-none cursor-pointer flex flex-col gap-1"
                        >
                            <span className="flex items-center gap-2">
                                <Download size={14} />
                                Download Backup Before Deleting
                            </span>
                            <span className="text-xs text-muted-foreground font-normal">
                                Export all workflow backups as a .zip file.
                            </span>
                        </label>
                    </div>
                ) : (
                    <div className="py-4 text-sm text-muted-foreground">
                        No workflow backups found for this server.
                    </div>
                )}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={status !== "idle"}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        onClick={handleDelete}
                        disabled={status !== "idle"}
                        className="min-w-[120px]"
                    >
                        {status === "backing_up" && (
                            <>
                                <Activity className="mr-2 h-4 w-4 animate-spin" />
                                Backing up...
                            </>
                        )}
                        {status === "deleting" && (
                            <>
                                <Activity className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        )}
                        {status === "idle" && (backupChecked && hasBackups ? "Backup & Delete" : "Delete Server")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
