-- ================================================================
-- N8KIZUNA DATABASE SETUP - COMPLETE SCHEMA
-- ================================================================
-- Run this script in the Supabase SQL Editor to set up the entire database structure.
-- This includes all tables, security policies, and plugin configurations.
--
-- Author: n8Kizuna Team
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
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own servers"
ON servers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own servers"
ON servers FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own servers"
ON servers FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 1.5 Create Security Policies for 'favorites'
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

CREATE POLICY "Users can view their own favorites"
ON favorites FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
ON favorites FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
ON favorites FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

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
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

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
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2.7 Storage Bucket Setup
-- Create a new bucket called 'backups'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('backups', 'backups', false)
ON CONFLICT (id) DO NOTHING;

-- 2.8 Storage Policies
CREATE POLICY "Users can upload their own backups"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'backups' AND auth.uid() = owner);

CREATE POLICY "Users can view their own backups"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'backups' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own backups"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'backups' AND auth.uid() = owner);

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
    ('cross_server_cloning', 'Cross-Server Cloning', 'Directly clone workflows from one server to another.', FALSE)
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
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3.6 Enable RLS for plugins
ALTER TABLE plugins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view plugins"
ON plugins FOR SELECT
TO authenticated
USING (true);

-- Allow users to toggle plugins (in a real app, this might be admin-only)
CREATE POLICY "Authenticated users can update plugins"
ON plugins FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ----------------------------------------------------------------
-- SETUP COMPLETE
-- ----------------------------------------------------------------
-- All tables, policies, and configurations have been created.
-- You can now use the n8Kizuna application with full functionality.
-- ----------------------------------------------------------------
