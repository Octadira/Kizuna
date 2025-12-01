import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import EditServerForm from "@/components/EditServerForm";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditServerPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: server } = await supabase
        .from("servers")
        .select("*")
        .eq("id", id)
        .single();

    if (!server) notFound();

    return <EditServerForm server={server} />;
}
