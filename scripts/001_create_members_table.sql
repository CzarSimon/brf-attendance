-- Create members table to store housing association member information
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY,
  apartment_number TEXT NOT NULL,
  address TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_members_name ON public.members USING gin(to_tsvector('swedish', name));
CREATE INDEX IF NOT EXISTS idx_members_apartment ON public.members (apartment_number);

-- Enable RLS for security
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Allow public read access for the attendance app (no user authentication required for this use case)
CREATE POLICY "members_select_all" ON public.members FOR SELECT USING (true);

-- Only allow inserts/updates through service role (for data import)
CREATE POLICY "members_insert_service" ON public.members FOR INSERT WITH CHECK (false);
CREATE POLICY "members_update_service" ON public.members FOR UPDATE USING (false);
CREATE POLICY "members_delete_service" ON public.members FOR DELETE USING (false);
