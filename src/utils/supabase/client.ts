import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.warn("⚠️ Supabase URL and Key are missing! Using placeholder values for build. App will not function correctly until environment variables are set.");
        // Return a dummy client to allow build to pass
        return createBrowserClient("https://placeholder.supabase.co", "placeholder");
    }

    // Auto-fix URL format
    let cleanUrl = supabaseUrl.trim();
    if (!cleanUrl.startsWith("http")) {
        cleanUrl = `https://${cleanUrl}`;
    }

    return createBrowserClient(cleanUrl, supabaseKey.trim());
}
