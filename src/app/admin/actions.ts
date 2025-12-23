"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export type AdminUser = {
    id: string;
    email?: string;
    fullName?: string;
    role: string;
    lastSignIn?: string;
    createdAt: string;
};

// Check if current user is admin
async function checkIsAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

    return data?.role === 'admin';
}

export async function getUsers(): Promise<{ users: AdminUser[], error?: string }> {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
        return { users: [], error: "Unauthorized access" };
    }

    const supabaseAdmin = createAdminClient();

    // Fetch all users from Auth
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
        console.error("Error fetching users:", authError);
        return { users: [], error: "Failed to fetch users" };
    }

    // Fetch all roles
    // We can use the admin client to bypass RLS and fetch all roles
    const { data: roles, error: rolesError } = await supabaseAdmin
        .from('user_roles')
        .select('*');

    if (rolesError) {
        console.error("Error fetching roles:", rolesError);
        return { users: [], error: "Failed to fetch user roles" };
    }

    // Map roles to a lookup object
    const roleMap = new Map(roles.map((r: any) => [r.user_id, r.role]));

    // Combine data
    const adminUsers: AdminUser[] = users.map((user) => ({
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name,
        role: roleMap.get(user.id) || 'user', // Default to user if no role entry
        lastSignIn: user.last_sign_in_at,
        createdAt: user.created_at,
    }));

    return { users: adminUsers };
}

export async function deleteUser(userId: string) {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
        return { error: "Unauthorized access" };
    }

    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin/users');
    return { success: true };
}

export async function inviteUser(email: string, fullName: string, role: string = 'user') {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
        return { error: "Unauthorized access" };
    }

    const supabaseAdmin = createAdminClient();

    // Invite user by email
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: { full_name: fullName }
    });

    if (error) {
        return { error: error.message };
    }

    // If role is 'admin', we need to update the user_roles table
    // Note: By default the user might not have a user_roles entry until they sign in 
    // OR we can pre-create it if we want.
    // However, since `user_roles` references `auth.users`, and inviteUser creates an auth user,
    // we can insert the role immediately.

    if (data.user) {
        const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .upsert({
                user_id: data.user.id,
                role: role
            });

        if (roleError) {
            console.error("Error setting role:", roleError);
            // We don't fail the whole action, but log it. 
            // The user exists, just role might be default.
        }
    }

    revalidatePath('/admin/users');
    return { success: true };
}
