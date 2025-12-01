import { createClient } from "@/utils/supabase/server";
import { WorkflowCard } from "@/components/WorkflowCard";
import { Star } from "lucide-react";
import { redirect } from "next/navigation";
import { decrypt } from "@/utils/encryption";
import { getN8nWorkflow } from "@/lib/n8n";

export default async function FavoritesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: favorites } = await supabase
        .from("favorites")
        .select(`
      *,
      servers (
        id,
        name,
        url,
        api_key
      )
    `)
        .order("created_at", { ascending: false });

    // Fetch live data for each favorite
    const favoritesWithLiveData = await Promise.all(
        (favorites || []).map(async (fav: any) => {
            try {
                const apiKey = decrypt(fav.servers.api_key);
                const workflowData = await getN8nWorkflow(fav.servers.url, apiKey, fav.workflow_id);

                if (workflowData) {
                    return {
                        ...fav,
                        workflow: {
                            id: workflowData.id,
                            name: workflowData.name,
                            active: workflowData.active,
                            tags: workflowData.tags || [],
                            description: workflowData.description, // Description might be here if fetched individually
                            updatedAt: workflowData.updatedAt,
                        }
                    };
                }
                // Fallback if fetch fails or workflow deleted
                return {
                    ...fav,
                    workflow: {
                        id: fav.workflow_id,
                        name: fav.workflow_name,
                        active: false, // Default to inactive if can't reach
                        tags: [],
                        updatedAt: new Date().toISOString(),
                    }
                };
            } catch (error) {
                return {
                    ...fav,
                    workflow: {
                        id: fav.workflow_id,
                        name: fav.workflow_name,
                        active: false,
                        tags: [],
                        updatedAt: new Date().toISOString(),
                    }
                };
            }
        })
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                    Favorites
                    <Star className="text-yellow-500 fill-yellow-500" size={24} />
                </h1>
                <p className="text-muted-foreground mt-1">Your most used workflows across all servers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favoritesWithLiveData && favoritesWithLiveData.length > 0 ? (
                    favoritesWithLiveData.map((fav: any) => (
                        <div key={fav.id} className="relative">
                            {/* Server badge overlay */}
                            <div className="absolute -top-2 -right-2 z-10 bg-primary text-primary-foreground text-[10px] px-2 py-1 rounded-full shadow-md font-bold uppercase tracking-wider">
                                {fav.servers.name}
                            </div>
                            <WorkflowCard
                                workflow={fav.workflow}
                                serverId={fav.servers.id}
                                serverUrl={fav.servers.url}
                                isFavorite={true}
                            />
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                            <Star className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">No favorites yet</h3>
                        <p className="text-muted-foreground mt-2">
                            Star workflows in your server pages to see them here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
