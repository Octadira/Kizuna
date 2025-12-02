-- 1. Create 'workflow_notes' table
CREATE TABLE IF NOT EXISTS workflow_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    server_id UUID REFERENCES servers(id) ON DELETE CASCADE NOT NULL,
    workflow_id TEXT NOT NULL,
    note TEXT
);

-- 2. Enable RLS for notes
ALTER TABLE workflow_notes ENABLE ROW LEVEL SECURITY;

-- 3. Policies for notes
CREATE POLICY "Users can manage their own notes"
ON workflow_notes
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Create 'workflow_backups' table (metadata for storage)
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

-- 5. Enable RLS for backups
ALTER TABLE workflow_backups ENABLE ROW LEVEL SECURITY;

-- 6. Policies for backups
CREATE POLICY "Users can manage their own backups"
ON workflow_backups
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. Storage Bucket Setup (You need to run this manually or via dashboard if SQL fails for storage)
-- Create a new bucket called 'backups'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('backups', 'backups', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
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
