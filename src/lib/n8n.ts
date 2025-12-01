export interface N8nWorkflow {
    id: string;
    name: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    tags: { id: string; name: string }[];
    description?: string; // n8n workflows might have a description
}

export interface ServerStatus {
    online: boolean;
    workflowCount: number;
    activeWorkflowCount: number;
    version?: string;
}

export async function getServerStatus(baseUrl: string, apiKey: string): Promise<ServerStatus> {
    try {
        const workflows = await getN8nWorkflows(baseUrl, apiKey);
        return {
            online: true,
            workflowCount: workflows.length,
            activeWorkflowCount: workflows.filter(w => w.active).length,
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
        const res = await fetch(`${cleanUrl}/api/v1/workflows`, {
            headers: {
                'X-N8N-API-KEY': apiKey,
            },
            next: { revalidate: 0 }, // Disable cache to get latest status
        });

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
        console.error("n8n API Error:", error);
        throw error;
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

export async function getExecutions(baseUrl: string, apiKey: string, limit: number = 50): Promise<any[]> {
    const cleanUrl = baseUrl.replace(/\/$/, "");
    try {
        const res = await fetch(`${cleanUrl}/api/v1/executions?limit=${limit}`, {
            headers: { 'X-N8N-API-KEY': apiKey },
            next: { revalidate: 10 }, // Cache for 10 seconds
        });

        if (!res.ok) {
            return [];
        }

        const data = await res.json();
        return data.data || [];
    } catch (error) {
        console.error("n8n Get Executions Error:", error);
        return [];
    }
}
