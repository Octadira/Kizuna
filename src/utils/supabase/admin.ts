import { createClient } from '@supabase/supabase-js';

// Note: This client uses the SERVICE ROLE KEY. 
// It should ONLY be used in server-side contexts (Server Actions, API Routes) 
// and NEVER exposed to the client.
export const createAdminClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
};
