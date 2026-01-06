-- ================================================================
-- KIZUNA DATABASE SETUP - COMPLETE SCHEMA
-- ================================================================
-- Run this script in the Supabase SQL Editor to set up the entire database structure.
-- This includes all tables, security policies, and plugin configurations.
--
-- Author: Kizuna Team
-- Last Updated: 2025-12-03
-- ================================================================

-- ----------------------------------------------------------------
-- SECTION 1: BASE SCHEMA - Core Tables
-- ----------------------------------------------------------------
-- NOTE ABOUT AUTHENTICATION:
-- This script assumes Supabase Auth is already active (it is by default).
-- It references the built-in 'auth.users' table to link data to specific users.
-- You do NOT need to create a users table manually.

-- 1.1 Create 'servers' table
CREATE TABLE IF NOT EXISTS servers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Links to Supabase Auth User ID
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    api_key TEXT NOT NULL,
    description TEXT
);

-- 1.2 Create 'favorites' table
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    server_id UUID REFERENCES servers(id) ON DELETE CASCADE NOT NULL,
    workflow_id TEXT NOT NULL,
    workflow_name TEXT NOT NULL
);

-- 1.3 Enable Row Level Security (RLS) for base tables
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 1.4 Create Security Policies for 'servers'
-- Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Users can view their own servers" ON servers;
DROP POLICY IF EXISTS "Users can insert their own servers" ON servers;
DROP POLICY IF EXISTS "Users can update their own servers" ON servers;
DROP POLICY IF EXISTS "Users can delete their own servers" ON servers;

CREATE POLICY "Users can view their own servers"
ON servers FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own servers"
ON servers FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own servers"
ON servers FOR UPDATE
TO authenticated
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own servers"
ON servers FOR DELETE
TO authenticated
USING ((select auth.uid()) = user_id);

-- 1.5 Create Security Policies for 'favorites'
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can manage their favorites" ON favorites;

CREATE POLICY "Users can view their own favorites"
ON favorites FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own favorites"
ON favorites FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own favorites"
ON favorites FOR DELETE
TO authenticated
USING ((select auth.uid()) = user_id);

-- 1.6 Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_servers_user_id ON servers(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_server_id ON favorites(server_id);

-- ----------------------------------------------------------------
-- SECTION 2: EXTENDED FEATURES - Notes & Backups
-- ----------------------------------------------------------------

-- 2.1 Create 'workflow_notes' table
CREATE TABLE IF NOT EXISTS workflow_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    server_id UUID REFERENCES servers(id) ON DELETE CASCADE NOT NULL,
    workflow_id TEXT NOT NULL,
    note TEXT
);

-- 2.2 Enable RLS for notes
ALTER TABLE workflow_notes ENABLE ROW LEVEL SECURITY;

-- 2.3 Policies for notes
CREATE POLICY "Users can manage their own notes"
ON workflow_notes
FOR ALL
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- 2.4 Create 'workflow_backups' table (metadata for storage)
CREATE TABLE IF NOT EXISTS workflow_backups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    server_id UUID REFERENCES servers(id) ON DELETE CASCADE NOT NULL,
    workflow_id TEXT NOT NULL,
    workflow_name TEXT NOT NULL,
    storage_path TEXT NOT NULL, -- Path in Supabase Storage
    version INT DEFAULT 1
);

-- 2.5 Enable RLS for backups
ALTER TABLE workflow_backups ENABLE ROW LEVEL SECURITY;

-- 2.6 Policies for backups
CREATE POLICY "Users can manage their own backups"
ON workflow_backups
FOR ALL
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- 2.7 Storage Bucket Setup
-- Create a new bucket called 'backups'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('backups', 'backups', false)
ON CONFLICT (id) DO NOTHING;

-- 2.8 Storage Policies
CREATE POLICY "Users can upload their own backups"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'backups' AND (select auth.uid()) = owner);

CREATE POLICY "Users can view their own backups"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'backups' AND (select auth.uid()) = owner);

CREATE POLICY "Users can delete their own backups"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'backups' AND (select auth.uid()) = owner);

-- ----------------------------------------------------------------
-- SECTION 3: PLUGIN SYSTEM
-- ----------------------------------------------------------------

-- 3.1 Create 'plugins' table to manage features
CREATE TABLE IF NOT EXISTS plugins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL, -- e.g., 'workflow_templates', 'cross_server_cloning'
    name TEXT NOT NULL,
    description TEXT,
    version TEXT DEFAULT '1.0.0',
    enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 Insert default plugins (initially disabled as requested)
INSERT INTO plugins (key, name, description, enabled)
VALUES 
    ('workflow_templates', 'Workflow Templates', 'Save workflows as templates and reuse them across servers.', FALSE),
    ('cross_server_cloning', 'Cross-Server Cloning', 'Directly clone workflows from one server to another.', FALSE),
    ('theme_switcher', 'Theme Switcher', 'Enable the ability to switch between different visual themes.', FALSE),
    ('animated_background', 'Animated Background', 'Enable the geometric animated background across the entire application.', FALSE)
ON CONFLICT (key) DO NOTHING;

-- 3.3 Create 'workflow_templates' table (for the Templates plugin)
CREATE TABLE IF NOT EXISTS workflow_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    workflow_data JSONB NOT NULL, -- The actual n8n workflow JSON
    tags TEXT[] DEFAULT '{}'
);

-- 3.4 Enable RLS for templates
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;

-- 3.5 Policies for templates
CREATE POLICY "Users can manage their own templates"
ON workflow_templates
FOR ALL
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- 3.6 Enable RLS for plugins
ALTER TABLE plugins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view plugins"
ON plugins FOR SELECT
TO authenticated
USING (true);

-- Allow users to toggle plugins (deprecated - see Section 4 for RBAC)
-- Policy moved to Section 4

-- ----------------------------------------------------------------
-- SECTION 4: ROLE-BASED ACCESS CONTROL (RBAC)
-- ----------------------------------------------------------------

-- 4.1 Create 'user_roles' table
-- IMPORTANT: To access Admin features (User Management), you must have the 'admin' role.
-- Also, the application requires SUPABASE_SERVICE_ROLE_KEY in .env.local for admin actions.

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user', -- 'admin' or 'user'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Helper to set first admin (Run this manually for your user)
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('YOUR_USER_ID_HERE', 'admin')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- 4.2 Enable RLS for user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 4.3 Policies for user_roles
-- Users can read their own role
CREATE POLICY "Users can read their own role"
ON user_roles FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

-- Only admins (or system) can update roles - for now we'll leave it restricted
-- In a real app, you'd have an admin panel or SQL migration to set admins.

-- 4.4 Update Plugins Policy to restrict updates to Admins
DROP POLICY IF EXISTS "Authenticated users can update plugins" ON plugins;

CREATE POLICY "Admins can update plugins"
ON plugins FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = (select auth.uid()) 
        AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = (select auth.uid()) 
        AND role = 'admin'
    )
);

-- ----------------------------------------------------------------
-- SECTION 5: GITHUB INTEGRATION
-- ----------------------------------------------------------------

-- 5.1 Create 'github_integrations' table
CREATE TABLE IF NOT EXISTS github_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    owner TEXT NOT NULL,
    repo TEXT NOT NULL,
    branch TEXT DEFAULT 'main',
    access_token TEXT NOT NULL, -- Encrypted Personal Access Token
    UNIQUE(user_id)
);

-- 5.2 Enable RLS for github_integrations
ALTER TABLE github_integrations ENABLE ROW LEVEL SECURITY;

-- 5.3 Policies for github_integrations
CREATE POLICY "Users can manage their own github integration"
ON github_integrations
FOR ALL
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- 5.4 Add GitHub Sync plugin to default list
-- Note: We updated the INSERT statement in Section 3 to include this, or we can insert it here if not present.
INSERT INTO plugins (key, name, description, enabled)
VALUES 
    ('github_sync', 'GitHub Sync', 'Backup and version your workflows directly to GitHub.', FALSE)
ON CONFLICT (key) DO NOTHING;

-- ----------------------------------------------------------------
-- SECTION 6: AUDIT LOGGING
-- ----------------------------------------------------------------
-- NOTE: This section adds audit logging capabilities to track user actions.
-- All critical operations (server CRUD, workflow toggles, backups, etc.) are logged.

-- 6.1 Create 'audit_logs' table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Keep logs even if user is deleted
    action TEXT NOT NULL, -- 'server.create', 'workflow.toggle', 'backup.create', etc.
    resource_type TEXT NOT NULL, -- 'server', 'workflow', 'backup', 'template', etc.
    resource_id TEXT, -- UUID or ID of the affected resource
    metadata JSONB DEFAULT '{}' -- Additional context (e.g., { "name": "My Server", "url": "..." })
);

-- 6.2 Enable RLS for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 6.3 Policies for audit_logs
-- Users can only view their own audit logs
CREATE POLICY "Users can view their own audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

-- Users can insert their own audit logs (via application)
CREATE POLICY "Users can insert their own audit logs"
ON audit_logs FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

-- Admins can view all audit logs (for security monitoring)
CREATE POLICY "Admins can view all audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = (select auth.uid()) 
        AND role = 'admin'
    )
);

-- 6.4 Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);

-- ----------------------------------------------------------------
-- SETUP COMPLETE
-- ----------------------------------------------------------------
-- All tables, policies, and configurations have been created.
-- You can now use the Kizuna application with full functionality.
-- ----------------------------------------------------------------
