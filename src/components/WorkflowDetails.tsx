"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Switch } from "./ui/Switch";
import { Download, Activity, FileJson, Info, ExternalLink, Webhook, Copy, StickyNote, Loader2, Trash2, Save, Github } from "lucide-react";
import { toggleWorkflowStatus, saveWorkflowNote, saveWorkflowBackup, deleteBackup, fetchExecutionDetails, saveWorkflowTemplate, deployWorkflowToServer, fetchFullWorkflow, pushWorkflowToGithubAction, getBackupContent, restoreWorkflowVersion } from "@/app/actions";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/Dialog";
import { Input } from "./ui/Input";

interface WorkflowDetailsProps {
    workflow: any;
    executions: any[];
    serverId: string;
    serverUrl: string;
    initialNote?: string;
    backups?: any[];
    features?: { [key: string]: boolean };
    servers?: any[];
}

export function WorkflowDetails({ workflow, executions, serverId, serverUrl, initialNote = "", backups = [], features = {}, servers = [] }: WorkflowDetailsProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "executions" | "json" | "backups">("overview");
    const [isActive, setIsActive] = useState(workflow.active);
    const [statusLoading, setStatusLoading] = useState(false);

    const isArchived = workflow.archived === true || (workflow.tags && workflow.tags.some((t: any) => t.name.toLowerCase() === "archived"));

    // Full Workflow Data (fetched on demand)
    const [fullWorkflow, setFullWorkflow] = useState<any>(null);
    const [loadingFullWorkflow, setLoadingFullWorkflow] = useState(false);

    // Notes State
    const [note, setNote] = useState(initialNote);
    const [savingNote, setSavingNote] = useState(false);

    // Backup State
    const [backingUp, setBackingUp] = useState(false);
    const [restoring, setRestoring] = useState<string | null>(null);
    const [saveVersionDialogOpen, setSaveVersionDialogOpen] = useState(false);
    const [versionName, setVersionName] = useState("");

    const handleOpenSaveVersionDialog = () => {
        setVersionName(`${workflow.name} - ${new Date().toLocaleDateString()}`);
        setSaveVersionDialogOpen(true);
    };

    const handleConfirmSaveVersion = async () => {
        setBackingUp(true);
        try {
            const wf = await ensureFullWorkflow();
            if (!wf) return;
            // Use the custom name provided by the user
            await saveWorkflowBackup(serverId, workflow.id, versionName, wf);
            setSaveVersionDialogOpen(false);
            alert("Version saved successfully!");
        } catch (error) {
            console.error("Failed to create backup", error);
            alert("Failed to save version.");
        } finally {
            setBackingUp(false);
        }
    };

    const [selectedExecution, setSelectedExecution] = useState<any>(null);
    const [executionLoading, setExecutionLoading] = useState(false);
    const [executionDialogOpen, setExecutionDialogOpen] = useState(false);

    // Template State
    const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
    const [templateName, setTemplateName] = useState(workflow.name);
    const [templateDesc, setTemplateDesc] = useState("");
    const [savingTemplate, setSavingTemplate] = useState(false);

    // Cloning State
    const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
    const [targetServerId, setTargetServerId] = useState("");
    const [cloning, setCloning] = useState(false);


    const ensureFullWorkflow = async () => {
        if (fullWorkflow) return fullWorkflow;

        setLoadingFullWorkflow(true);
        try {
            const data = await fetchFullWorkflow(serverId, workflow.id);
            setFullWorkflow(data);
            return data;
        } catch (error) {
            console.error("Failed to fetch full workflow", error);
            alert("Failed to load full workflow data. Please try again.");
            return null;
        } finally {
            setLoadingFullWorkflow(false);
        }
    };

    const handleViewExecution = async (executionId: string) => {
        setExecutionLoading(true);
        setExecutionDialogOpen(true);
        try {
            const details = await fetchExecutionDetails(serverId, executionId);
            setSelectedExecution(details);
        } catch (error) {
            console.error("Failed to fetch execution details", error);
        } finally {
            setExecutionLoading(false);
        }
    };

    const handleSaveTemplate = async () => {
        setSavingTemplate(true);
        try {
            const wf = await ensureFullWorkflow();
            if (!wf) return;
            await saveWorkflowTemplate(templateName, templateDesc, wf);
            setTemplateDialogOpen(false);
            alert("Template saved successfully!");
        } catch (error) {
            console.error("Failed to save template", error);
            alert("Failed to save template.");
        } finally {
            setSavingTemplate(false);
        }
    };

    const handleCloneWorkflow = async () => {
        if (!targetServerId) return;
        setCloning(true);
        try {
            const wf = await ensureFullWorkflow();
            if (!wf) return;
            await deployWorkflowToServer(targetServerId, wf);
            setCloneDialogOpen(false);
            alert("Workflow cloned successfully!");
        } catch (error) {
            console.error("Failed to clone workflow", error);
            alert("Failed to clone workflow.");
        } finally {
            setCloning(false);
        }
    };

    const handleSaveNote = async () => {
        setSavingNote(true);
        try {
            await saveWorkflowNote(serverId, workflow.id, note);
        } catch (error) {
            console.error("Failed to save note", error);
        } finally {
            setSavingNote(false);
        }
    };

    const handleCreateBackup = async () => {
        setBackingUp(true);
        try {
            const wf = await ensureFullWorkflow();
            if (!wf) return;
            await saveWorkflowBackup(serverId, workflow.id, workflow.name, wf);
        } catch (error) {
            console.error("Failed to create backup", error);
        } finally {
            setBackingUp(false);
        }
    };

    // GitHub Push State
    const [pushDialogOpen, setPushDialogOpen] = useState(false);
    const [commitMessage, setCommitMessage] = useState("");
    const [pushStatus, setPushStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [pushResultMsg, setPushResultMsg] = useState("");

    const openPushDialog = () => {
        setCommitMessage(`Update workflow: ${workflow.name}`);
        setPushStatus('idle');
        setPushResultMsg("");
        setPushDialogOpen(true);
    };

    const handleConfirmPush = async () => {
        setPushStatus('loading');
        try {
            const wf = await ensureFullWorkflow();
            if (!wf) {
                setPushStatus('error');
                setPushResultMsg("Could not load full workflow data.");
                return;
            }

            await pushWorkflowToGithubAction(serverId, workflow.id, wf, commitMessage);
            setPushStatus('success');
            setPushResultMsg("Workflow pushed to GitHub successfully!");
        } catch (error: any) {
            console.error("Failed to push to GitHub", error);
            setPushStatus('error');
            if (error.message.includes("integration not configured")) {
                setPushResultMsg("GitHub integration is not configured. Please go to settings.");
            } else {
                setPushResultMsg(error.message || "An unknown error occurred.");
            }
        }
    };

    const handleDeleteBackup = async (id: string, path: string) => {
        if (!confirm("Are you sure you want to delete this version?")) return;
        try {
            await deleteBackup(id, path, serverId, workflow.id);
        } catch (error) {
            console.error("Failed to delete backup", error);
        }
    };

    const handleDownloadVersion = async (path: string, name: string) => {
        try {
            const content = await getBackupContent(path);
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(content);
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `${name}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        } catch (error) {
            console.error("Failed to download version", error);
            alert("Failed to download version.");
        }
    };

    const handleRestoreVersion = async (backupId: string, path: string) => {
        if (!confirm("Are you sure you want to restore/publish this version? This will overwrite the current live workflow.")) return;
        setRestoring(backupId);
        try {
            await restoreWorkflowVersion(serverId, workflow.id, path);
            alert("Version restored and published successfully!");
        } catch (error) {
            console.error("Failed to restore version", error);
            alert("Failed to restore version.");
        } finally {
            setRestoring(null);
        }
    };

    const handleDownload = async () => {
        const wf = await ensureFullWorkflow();
        if (!wf) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(wf, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${wf.name}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleToggleActive = async (checked: boolean) => {
        setStatusLoading(true);
        setIsActive(checked);
        try {
            await toggleWorkflowStatus(serverId, workflow.id, checked);
        } catch (error) {
            setIsActive(!checked);
            console.error("Failed to toggle status", error);
        } finally {
            setStatusLoading(false);
        }
    };

    // Webhook Helper Logic
    const webhookNode = workflow.nodes.find((n: any) => n.type === "n8n-nodes-base.webhook");
    const webhookPath = webhookNode?.parameters?.path;
    const webhookMethod = webhookNode?.parameters?.httpMethod || "GET";
    const productionUrl = webhookPath ? `${serverUrl.replace(/\/$/, "")}/webhook/${webhookPath}` : null;
    const testUrl = webhookPath ? `${serverUrl.replace(/\/$/, "")}/webhook-test/${webhookPath}` : null;

    return (
        <div className="space-y-6">
            {/* Save Version Dialog */}
            <Dialog open={saveVersionDialogOpen} onOpenChange={setSaveVersionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save New Version</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Version Name / Description</label>
                            <Input
                                value={versionName}
                                onChange={(e) => setVersionName(e.target.value)}
                                placeholder="e.g. v1.0 - Initial Release"
                            />
                            <p className="text-xs text-muted-foreground">
                                Give this version a meaningful name to easily identify it later.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSaveVersionDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirmSaveVersion} disabled={backingUp}>
                            {backingUp && <Loader2 className="animate-spin mr-2" size={14} />}
                            Save Version
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* GitHub Push Dialog */}
            <Dialog open={pushDialogOpen} onOpenChange={setPushDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Push to GitHub</DialogTitle>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        {pushStatus === 'idle' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Commit Message</label>
                                <textarea
                                    className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={commitMessage}
                                    onChange={(e) => setCommitMessage(e.target.value)}
                                    placeholder="Describe your changes..."
                                />
                            </div>
                        )}

                        {pushStatus === 'loading' && (
                            <div className="flex flex-col items-center justify-center py-6 gap-3 text-muted-foreground">
                                <Loader2 className="animate-spin" size={32} />
                                <p>Pushing to repository...</p>
                            </div>
                        )}

                        {pushStatus === 'success' && (
                            <div className="flex flex-col items-center justify-center py-4 gap-3 text-green-600 dark:text-green-400">
                                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <Github size={24} />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-semibold text-lg">Success!</h3>
                                    <p className="text-sm opacity-90">{pushResultMsg}</p>
                                </div>
                            </div>
                        )}

                        {pushStatus === 'error' && (
                            <div className="flex flex-col items-center justify-center py-4 gap-3 text-destructive">
                                <Info size={32} />
                                <div className="text-center">
                                    <h3 className="font-semibold text-lg">Push Failed</h3>
                                    <p className="text-sm opacity-90">{pushResultMsg}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        {pushStatus === 'idle' && (
                            <>
                                <Button variant="outline" onClick={() => setPushDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleConfirmPush} className="gap-2">
                                    <Github size={16} />
                                    Push Commit
                                </Button>
                            </>
                        )}
                        {pushStatus === 'success' && (
                            <Button onClick={() => setPushDialogOpen(false)}>Close</Button>
                        )}
                        {pushStatus === 'error' && (
                            <>
                                <Button variant="outline" onClick={() => setPushDialogOpen(false)}>Close</Button>
                                {pushResultMsg.includes("configured") && (
                                    <Button onClick={() => window.location.href = "/settings/github"}>
                                        Go to Settings
                                    </Button>
                                )}
                                {!pushResultMsg.includes("configured") && (
                                    <Button onClick={() => setPushStatus('idle')}>Try Again</Button>
                                )}
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Template Dialog */}
            <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save as Template</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Template Name</label>
                            <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Input value={templateDesc} onChange={(e) => setTemplateDesc(e.target.value)} placeholder="Optional description" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveTemplate} disabled={savingTemplate}>
                            {savingTemplate && <Loader2 className="animate-spin mr-2" size={14} />}
                            Save Template
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Clone Dialog */}
            <Dialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Clone to Another Server</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Target Server</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                value={targetServerId}
                                onChange={(e) => setTargetServerId(e.target.value)}
                            >
                                <option value="">Select a server...</option>
                                {servers.filter(s => s.id !== serverId).map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.url})</option>
                                ))}
                            </select>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            This will create a copy of the current workflow on the selected server. The new workflow will be inactive by default.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCloneDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCloneWorkflow} disabled={cloning || !targetServerId}>
                            {cloning && <Loader2 className="animate-spin mr-2" size={14} />}
                            Clone Workflow
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Execution Details Dialog */}
            <Dialog open={executionDialogOpen} onOpenChange={setExecutionDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Execution Details</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto p-4 bg-muted/30 rounded-md">
                        {executionLoading ? (
                            <div className="flex items-center justify-center h-40">
                                <Loader2 className="animate-spin text-muted-foreground" size={32} />
                            </div>
                        ) : selectedExecution ? (
                            <pre className="text-xs font-mono text-foreground whitespace-pre-wrap">
                                {JSON.stringify(selectedExecution, null, 2)}
                            </pre>
                        ) : (
                            <p className="text-center text-muted-foreground">No details available.</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Header Actions */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card p-6 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {isArchived ? (
                            <span className="px-3 py-1.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="5" x="2" y="3" rx="1" /><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /><path d="M10 12h4" /></svg>
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
                                <span className={cn("text-sm font-medium uppercase tracking-wider", isActive ? "text-green-500" : "text-muted-foreground")}>
                                    {isActive ? "Published" : "Unpublished"}
                                </span>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                    {features.workflow_templates && (
                        <Button variant="outline" onClick={() => setTemplateDialogOpen(true)} className="gap-2">
                            <Copy size={16} />
                            Save as Template
                        </Button>
                    )}

                    {features.cross_server_cloning && (
                        <Button variant="outline" onClick={() => setCloneDialogOpen(true)} className="gap-2">
                            <ExternalLink size={16} />
                            Clone to Server
                        </Button>
                    )}
                    <Button variant="outline" onClick={handleOpenSaveVersionDialog} disabled={backingUp || loadingFullWorkflow} className="gap-2">
                        {(backingUp || loadingFullWorkflow) ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Save Version
                    </Button>
                    {features.github_sync && (
                        <Button variant="outline" onClick={openPushDialog} disabled={loadingFullWorkflow} className="gap-2">
                            {loadingFullWorkflow ? <Loader2 className="animate-spin" size={16} /> : <Github size={16} />}
                            Push to GitHub
                        </Button>
                    )}
                    <Button variant="outline" onClick={handleDownload} disabled={loadingFullWorkflow} className="gap-2">
                        {loadingFullWorkflow ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                        Download JSON
                    </Button>
                    <a href={`${serverUrl.replace(/\/$/, "")}/workflow/${workflow.id}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="gap-2">
                            Open in n8n <ExternalLink size={16} />
                        </Button>
                    </a>
                </div>
            </div>

            {/* Webhook Helper Section */}
            {webhookNode && (
                <Card className="p-6 border-blue-500/20 bg-blue-500/5">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Webhook size={20} className="text-blue-500" />
                        Webhook Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Production URL</label>
                            <div className="flex gap-2">
                                <code className="flex-1 p-2 rounded bg-background border border-border text-xs font-mono truncate">
                                    {webhookMethod} {productionUrl}
                                </code>
                                <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(productionUrl || "")}>
                                    <Copy size={14} />
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Test URL</label>
                            <div className="flex gap-2">
                                <code className="flex-1 p-2 rounded bg-background border border-border text-xs font-mono truncate">
                                    {webhookMethod} {testUrl}
                                </code>
                                <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(testUrl || "")}>
                                    <Copy size={14} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Tabs Navigation */}
            <div className="flex gap-2 border-b border-border overflow-x-auto">
                <button
                    onClick={() => setActiveTab("overview")}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap",
                        activeTab === "overview"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Info size={16} /> Overview
                </button>
                <button
                    onClick={() => setActiveTab("executions")}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap",
                        activeTab === "executions"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Activity size={16} /> Executions
                </button>
                <button
                    onClick={() => setActiveTab("backups")}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap",
                        activeTab === "backups"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Save size={16} /> Versions
                </button>
                <button
                    onClick={() => setActiveTab("json")}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap",
                        activeTab === "json"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    <FileJson size={16} /> JSON
                </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-6 space-y-4">
                            <h3 className="font-semibold text-lg">Details</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">ID</span>
                                    <span className="font-mono">{workflow.id}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Created</span>
                                    <span>{new Date(workflow.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Updated</span>
                                    <span>{new Date(workflow.updatedAt).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Tags</span>
                                    <div className="flex flex-wrap gap-1 justify-end">
                                        {workflow.tags.map((tag: any) => (
                                            <span key={tag.id} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Private Notes Section */}
                        <Card className="p-6 space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <StickyNote size={20} />
                                Private Notes
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Keep track of implementation details, TODOs, or specific configurations for this workflow.
                            </p>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full h-32 p-3 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Add your notes here..."
                            />
                            <div className="flex justify-end">
                                <Button size="sm" onClick={handleSaveNote} disabled={savingNote}>
                                    {savingNote ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
                                    Save Notes
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === "backups" && (
                    <Card className="overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/30">
                            <p className="text-sm text-muted-foreground">
                                Versions are stored securely in Secure Storage. You can restore them by downloading the JSON and importing it into n8n.
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Date</th>
                                        <th className="px-4 py-3 font-medium">Name</th>
                                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {backups.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                                                No versions found. Create one to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        backups.map((backup) => (
                                            <tr key={backup.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {new Date(backup.created_at).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 font-medium">{backup.workflow_name}</td>
                                                <td className="px-4 py-3 text-right flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-muted-foreground hover:text-foreground"
                                                        onClick={() => handleRestoreVersion(backup.id, backup.storage_path)}
                                                        disabled={restoring === backup.id}
                                                    >
                                                        {restoring === backup.id ? <Loader2 className="animate-spin" size={14} /> : "Restore"}
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-primary hover:text-primary hover:bg-primary/10" onClick={() => handleDownloadVersion(backup.storage_path, backup.workflow_name)}>
                                                        <Download size={16} />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteBackup(backup.id, backup.storage_path)}>
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {activeTab === "executions" && (
                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">ID</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Mode</th>
                                        <th className="px-4 py-3 font-medium">Started</th>
                                        <th className="px-4 py-3 font-medium">Duration</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {executions.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                                No executions found.
                                            </td>
                                        </tr>
                                    ) : (
                                        executions.map((exec) => (
                                            <tr
                                                key={exec.id}
                                                className="hover:bg-muted/50 transition-colors cursor-pointer"
                                                onClick={() => handleViewExecution(exec.id)}
                                            >
                                                <td className="px-4 py-3 font-mono text-xs">{exec.id}</td>
                                                <td className="px-4 py-3">
                                                    <span className={cn(
                                                        "px-2 py-1 rounded-full text-xs font-medium",
                                                        exec.finished ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                                                    )}>
                                                        {exec.finished ? "Success" : "Running"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground capitalize">{exec.mode}</td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {new Date(exec.startedAt).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {exec.stoppedAt ? `${((new Date(exec.stoppedAt).getTime() - new Date(exec.startedAt).getTime()) / 1000).toFixed(2)}s` : "-"}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {activeTab === "json" && (
                    <Card className="p-0 overflow-hidden bg-muted/30">
                        <div className="p-4 bg-muted/50 border-b border-border flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">workflow.json</span>
                            <Button variant="ghost" size="sm" onClick={handleDownload}>
                                <Download size={14} className="mr-2" /> Download
                            </Button>
                        </div>
                        <div className="p-4 overflow-auto max-h-[600px] text-xs font-mono text-foreground">
                            {fullWorkflow ? (
                                <pre>{JSON.stringify(fullWorkflow, null, 2)}</pre>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 gap-4">
                                    <p className="text-muted-foreground">Full workflow JSON is not loaded.</p>
                                    <Button onClick={ensureFullWorkflow} disabled={loadingFullWorkflow}>
                                        {loadingFullWorkflow && <Loader2 className="animate-spin mr-2" size={14} />}
                                        Load JSON
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
