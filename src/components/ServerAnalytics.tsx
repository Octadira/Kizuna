import { Card } from "@/components/ui/Card";
import { Activity, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface Execution {
    id: string;
    finished: boolean;
    stoppedAt?: string;
    status?: 'success' | 'error' | 'waiting' | 'unknown';
    mode: string;
    startedAt: string;
}

interface ServerAnalyticsProps {
    executions: Execution[];
}

export function ServerAnalytics({ executions }: ServerAnalyticsProps) {
    const totalExecutions = executions.length;

    // Refined logic based on common n8n response:
    // e.finished = true
    // e.mode = 'webhook', 'trigger', 'manual'
    // We'll trust 'finished' for completion. 
    // For success/failure, we might need to infer or check if there's a status field.
    // Based on search, status can be 'success', 'error'.

    const successCount = executions.filter((e) => e.finished && (e.status === 'success' || !e.status)).length; // Fallback if status missing but finished
    const errorCount = executions.filter((e) => e.status === 'error').length;

    const successRate = totalExecutions > 0 ? Math.round((successCount / totalExecutions) * 100) : 0;

    const recentFailures = executions
        .filter((e) => e.status === 'error')
        .slice(0, 5);

    return (
        <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Activity size={18} />
                Recent Activity (Last {totalExecutions})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-5 bg-card border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-full bg-blue-500/10 text-blue-500">
                            <Activity size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Total Executions</p>
                            <h3 className="text-xl font-bold text-foreground">{totalExecutions}</h3>
                        </div>
                    </div>
                </Card>

                <Card className="p-5 bg-card border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-full bg-green-500/10 text-green-500">
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Success Rate</p>
                            <h3 className="text-xl font-bold text-foreground">{successRate}%</h3>
                        </div>
                    </div>
                </Card>

                <Card className="p-5 bg-card border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-full bg-red-500/10 text-red-500">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Failed Executions</p>
                            <h3 className="text-xl font-bold text-foreground">{errorCount}</h3>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="p-5 bg-card border-border">
                <h3 className="text-base font-medium text-foreground mb-3 flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-500" />
                    Recent Failures
                </h3>
                {recentFailures.length > 0 ? (
                    <div className="space-y-3">
                        {recentFailures.map((exec) => (
                            <div key={exec.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-red-500" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            Execution ID: {exec.id}
                                        </p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock size={10} />
                                            {new Date(exec.startedAt).toLocaleString('en-GB')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-xs font-mono bg-background px-2 py-1 rounded border border-border">
                                    {exec.mode}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg bg-muted/30">
                        No recent failures recorded.
                    </div>
                )}
            </Card>
        </div>
    );
}
