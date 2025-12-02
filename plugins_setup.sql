-- 1. Create 'plugins' table to manage features
CREATE TABLE IF NOT EXISTS plugins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL, -- e.g., 'workflow_templates', 'cross_server_cloning'
    name TEXT NOT NULL,
    description TEXT,
    version TEXT DEFAULT '1.0.0',
    enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insert default plugins (initially disabled as requested)
INSERT INTO plugins (key, name, description, enabled)
VALUES 
    ('workflow_templates', 'Workflow Templates', 'Save workflows as templates and reuse them across servers.', FALSE),
    ('cross_server_cloning', 'Cross-Server Cloning', 'Directly clone workflows from one server to another.', FALSE)
ON CONFLICT (key) DO NOTHING;

-- 3. Create 'workflow_templates' table (for the Templates plugin)
CREATE TABLE IF NOT EXISTS workflow_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    workflow_data JSONB NOT NULL, -- The actual n8n workflow JSON
    tags TEXT[] DEFAULT '{}'
);

-- 4. Enable RLS for templates
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;

-- 5. Policies for templates
CREATE POLICY "Users can manage their own templates"
ON workflow_templates
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Enable RLS for plugins (read-only for users, or admin only? For now, let authenticated users read/toggle)
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
