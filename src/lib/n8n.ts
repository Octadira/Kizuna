export interface N8nWorkflow {
    id: string;
    name: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    tags: { id: string; name: string }[];
    description?: string; // n8n workflows might have a description
}

export interface N8nVersionInfo {
    version?: string;
    updateAvailable?: boolean;
}

export interface ServerStatus {
    online: boolean;
    workflowCount: number;
    activeWorkflowCount: number;
    version?: string;
    updateAvailable?: boolean;
}

// Helper to compare versions
function compareVersions(v1: string, v2: string): number {
    const parts1 = v1.replace(/[^0-9.]/g, '').split('.').map(Number);
    const parts2 = v2.replace(/[^0-9.]/g, '').split('.').map(Number);
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;
        if (p1 > p2) return 1;
        if (p1 < p2) return -1;
    }
    return 0;
}

let latestVersionCache: { version: string, timestamp: number } | null = null;

async function getLatestN8nVersion(): Promise<string | null> {
    if (latestVersionCache && Date.now() - latestVersionCache.timestamp < 1000 * 60 * 60) { // 1 hour cache
        return latestVersionCache.version;
    }
    try {
        const res = await fetch('https://registry.npmjs.org/n8n/latest', { next: { revalidate: 3600 } });
        if (res.ok) {
            const data = await res.json();
            const version = data.version;
            latestVersionCache = { version, timestamp: Date.now() };
            return version;
        }
    } catch (e) {
        console.error("Failed to fetch latest n8n version", e);
    }
    return null;
}

// Helper to fetch/extract version
export async function getN8nVersionInfo(baseUrl: string, apiKey: string): Promise<N8nVersionInfo> {
    const cleanUrl = baseUrl.replace(/\/$/, "");
    let version: string | undefined;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        // 1. Try API GET for headers
        try {
            const res = await fetch(`${cleanUrl}/api/v1/workflows?limit=1`, {
                method: 'GET',
                headers: { 'X-N8N-API-KEY': apiKey },
                next: { revalidate: 60 },
                signal: controller.signal,
            });

            version = res.headers.get('x-n8n-version') || undefined;
        } catch (e) {
            // Silent fail - try next method
        }

        // 2. Try /healthz
        if (!version) {
            try {
                const healthRes = await fetch(`${cleanUrl}/healthz`, {
                    next: { revalidate: 60 },
                    signal: controller.signal
                });
                version = healthRes.headers.get('x-n8n-version') || undefined;
            } catch (e) { }
        }

        // 3. Try Root URL headers AND body parsing
        if (!version) {
            try {
                const rootRes = await fetch(`${cleanUrl}/`, {
                    next: { revalidate: 60 },
                    signal: controller.signal
                });

                version = rootRes.headers.get('x-n8n-version') || undefined;

                // If header missing, search body for n8n:config:sentry
                if (!version && rootRes.ok) {
                    const text = await rootRes.text();

                    // Match <meta name="n8n:config:sentry" content="...">
                    const sentryMatch = text.match(/<metaName="n8n:config:sentry"\s+content="([^"]+)"/i) ||
                        text.match(/<meta\s+name="n8n:config:sentry"\s+content="([^"]+)"/i);

                    if (sentryMatch && sentryMatch[1]) {
                        try {
                            const decoded = atob(sentryMatch[1]);
                            const config = JSON.parse(decoded);
                            // config.release should be like "n8n@1.122.5"
                            if (config.release && typeof config.release === 'string') {
                                const versionMatch = config.release.match(/n8n@([\d.]+)/);
                                if (versionMatch && versionMatch[1]) {
                                    version = versionMatch[1];
                                }
                            }
                        } catch (e) {
                            // Silent fail on parse error
                        }
                    }
                }
            } catch (e) { }
        }

        clearTimeout(timeoutId);

    } catch (e) {
        // Silent fail
    }

    let updateAvailable = false;
    if (version) {
        const latest = await getLatestN8nVersion();
        if (latest && compareVersions(latest, version) > 0) {
            updateAvailable = true;
        }
    }

    return { version, updateAvailable };
}

export async function getServerStatus(baseUrl: string, apiKey: string, skipVersionCheck: boolean = false): Promise<ServerStatus> {
    const cleanUrl = baseUrl.replace(/\/$/, "");

    // Fast workflow check with reduced timeout for better UX
    const workflowPromise = (async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // Increased to 5s timeout

        const res = await fetch(`${cleanUrl}/api/v1/workflows`, {
            headers: {
                'X-N8N-API-KEY': apiKey,
            },
            next: { revalidate: 60 },
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
            throw new Error(`Failed to fetch workflows: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        return data.data as N8nWorkflow[];
    })();

    try {
        // If skipVersionCheck is true, only fetch workflows (for list view optimization)
        if (skipVersionCheck) {
            const workflows = await workflowPromise;
            return {
                online: true,
                workflowCount: workflows.length,
                activeWorkflowCount: workflows.filter(w => w.active).length,
            };
        }

        // Full check with version info (for server detail page)
        const versionPromise = getN8nVersionInfo(baseUrl, apiKey);
        const [workflowsResult, versionResult] = await Promise.allSettled([workflowPromise, versionPromise]);

        if (workflowsResult.status === 'rejected') {
            throw new Error(workflowsResult.reason);
        }

        const workflows = workflowsResult.value;
        const versionInfo = versionResult.status === 'fulfilled' ? versionResult.value : { version: undefined, updateAvailable: undefined };

        return {
            online: true,
            workflowCount: workflows.length,
            activeWorkflowCount: workflows.filter(w => w.active).length,
            version: versionInfo.version,
            updateAvailable: versionInfo.updateAvailable
        };

    } catch (error) {
        return {
            online: false,
            workflowCount: 0,
            activeWorkflowCount: 0,
        };
    }
}

export async function getN8nWorkflows(baseUrl: string, apiKey: string, fetchDetails: boolean = false): Promise<N8nWorkflow[]> {
    // Ensure URL doesn't end with slash
    const cleanUrl = baseUrl.replace(/\/$/, "");

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const res = await fetch(`${cleanUrl}/api/v1/workflows`, {
            headers: {
                'X-N8N-API-KEY': apiKey,
            },
            next: { revalidate: 60 },
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
            throw new Error(`Failed to fetch workflows: ${res.statusText}`);
        }

        const data = await res.json();
        const workflows: N8nWorkflow[] = data.data;

        if (fetchDetails && workflows.length > 0) {
            // Fetch details for each workflow to get the description
            // Limit concurrency if needed, but for now Promise.all is fine for reasonable counts
            const detailedWorkflows = await Promise.all(
                workflows.map(async (wf) => {
                    try {
                        const details = await getN8nWorkflow(baseUrl, apiKey, wf.id);
                        // n8n workflow JSON usually has 'name', 'nodes', 'connections', etc.
                        // The description might be in the root or not present if not set.
                        // We'll look for 'description' property.
                        return {
                            ...wf,
                            tags: details?.tags || wf.tags,
                            description: details?.description || undefined
                        };
                    } catch (e) {
                        return wf;
                    }
                })
            );
            return detailedWorkflows;
        }

        return workflows;
    } catch (error) {
        console.error("n8n Connection Error:", error);
        return [];
    }
}

export async function getN8nWorkflow(baseUrl: string, apiKey: string, workflowId: string): Promise<any> {
    const cleanUrl = baseUrl.replace(/\/$/, "");
    try {
        const res = await fetch(`${cleanUrl}/api/v1/workflows/${workflowId}`, {
            headers: { 'X-N8N-API-KEY': apiKey },
            next: { revalidate: 0 },
        });
        if (!res.ok) throw new Error(`Failed to fetch workflow ${workflowId}`);
        return await res.json();
    } catch (error) {
        console.error("n8n Get Workflow Error:", error);
        return null;
    }
}

export async function toggleN8nWorkflowActive(baseUrl: string, apiKey: string, workflowId: string, active: boolean): Promise<boolean> {
    const cleanUrl = baseUrl.replace(/\/$/, "");
    try {
        // n8n API uses POST /workflows/{id}/activate or deactivate
        const endpoint = active ? 'activate' : 'deactivate';
        const res = await fetch(`${cleanUrl}/api/v1/workflows/${workflowId}/${endpoint}`, {
            method: 'POST',
            headers: { 'X-N8N-API-KEY': apiKey },
        });

        if (!res.ok) {
            // Fallback: try PATCH if activate/deactivate endpoints don't exist (older n8n versions)
            const patchRes = await fetch(`${cleanUrl}/api/v1/workflows/${workflowId}`, {
                method: 'PUT', // n8n v1 uses PUT for update usually, or PATCH
                headers: {
                    'X-N8N-API-KEY': apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ active }),
            });
            return patchRes.ok;
        }
        return true;
    } catch (error) {
        console.error("n8n Toggle Error:", error);
        throw error;
    }
}

export async function getExecutions(baseUrl: string, apiKey: string, limit: number = 50, workflowId?: string): Promise<any[]> {
    const cleanUrl = baseUrl.replace(/\/$/, "");
    try {
        const query = `limit=${limit}${workflowId ? `&workflowId=${workflowId}` : ''}`;

        const res = await fetch(`${cleanUrl}/api/v1/executions?${query}`, {
            headers: { 'X-N8N-API-KEY': apiKey },
            next: { revalidate: 10 }, // 10s cache
        });

        if (!res.ok) {
            return [];
        }

        const data = await res.json();
        const executions = data.data || [];
        return executions;
    } catch (error) {
        console.error("n8n Get Executions Error:", error);
        return [];
    }
}

export async function getExecution(baseUrl: string, apiKey: string, executionId: string): Promise<any> {
    const cleanUrl = baseUrl.replace(/\/$/, "");
    try {
        const res = await fetch(`${cleanUrl}/api/v1/executions/${executionId}`, {
            headers: { 'X-N8N-API-KEY': apiKey },
            next: { revalidate: 0 },
        });

        if (!res.ok) {
            return null;
        }

        return await res.json();
    } catch (error) {
        console.error("n8n Get Execution Error:", error);
        return null;
    }
}

export async function createN8nWorkflow(baseUrl: string, apiKey: string, workflowData: any): Promise<any> {
    const cleanUrl = baseUrl.replace(/\/$/, "");
    try {
        const res = await fetch(`${cleanUrl}/api/v1/workflows`, {
            method: 'POST',
            headers: {
                'X-N8N-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workflowData),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to create workflow: ${res.status} ${errorText}`);
        }

        return await res.json();
    } catch (error) {
        console.error("n8n Create Workflow Error:", error);
        throw error;
    }
}

export async function updateN8nWorkflow(baseUrl: string, apiKey: string, workflowId: string, workflowData: any): Promise<any> {
    const cleanUrl = baseUrl.replace(/\/$/, "");
    try {
        const res = await fetch(`${cleanUrl}/api/v1/workflows/${workflowId}`, {
            method: 'PUT',
            headers: {
                'X-N8N-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workflowData),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to update workflow: ${res.status} ${errorText}`);
        }

        return await res.json();
    } catch (error) {
        console.error("n8n Update Workflow Error:", error);
        throw error;
    }
}
