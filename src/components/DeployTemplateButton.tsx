"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/Dialog";
import { Loader2, Server, Play } from "lucide-react";
import { deployWorkflowToServer } from "@/app/actions";

interface DeployTemplateButtonProps {
    template: any;
    servers: any[];
}

export function DeployTemplateButton({ template, servers }: DeployTemplateButtonProps) {
    const [open, setOpen] = useState(false);
    const [targetServerId, setTargetServerId] = useState("");
    const [deploying, setDeploying] = useState(false);

    const handleDeploy = async () => {
        if (!targetServerId) return;
        setDeploying(true);
        try {
            await deployWorkflowToServer(targetServerId, template.workflow_data);
            setOpen(false);
            alert("Template deployed successfully!");
        } catch (error) {
            console.error("Failed to deploy template", error);
            alert("Failed to deploy template.");
        } finally {
            setDeploying(false);
        }
    };

    return (
        <>
            <Button className="flex-1 gap-2" onClick={() => setOpen(true)}>
                <Play size={16} /> Deploy
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Deploy Template: {template.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Target Server</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                value={targetServerId}
                                onChange={(e) => setTargetServerId(e.target.value)}
                            >
                                <option value="">Select a server...</option>
                                {servers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.url})</option>
                                ))}
                            </select>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            A new workflow will be created on the selected server using this template.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleDeploy} disabled={deploying || !targetServerId}>
                            {deploying && <Loader2 className="animate-spin mr-2" size={14} />}
                            Deploy
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
