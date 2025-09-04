-- Create meetings table to store meeting configuration
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_meetings_date ON public.meetings (date);
CREATE INDEX IF NOT EXISTS idx_meetings_active ON public.meetings (is_active);

-- Enable RLS for security
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Allow public read access for active meetings
CREATE POLICY "meetings_select_active" ON public.meetings FOR SELECT USING (is_active = true);

-- Only allow inserts/updates through service role
CREATE POLICY "meetings_insert_service" ON public.meetings FOR INSERT WITH CHECK (false);
CREATE POLICY "meetings_update_service" ON public.meetings FOR UPDATE USING (false);
CREATE POLICY "meetings_delete_service" ON public.meetings FOR DELETE USING (false);

-- Function to set active meeting (only one can be active at a time)
CREATE OR REPLACE FUNCTION set_active_meeting(meeting_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Deactivate all meetings
  UPDATE public.meetings SET is_active = false, updated_at = NOW();
  
  -- Activate the specified meeting
  UPDATE public.meetings 
  SET is_active = true, updated_at = NOW() 
  WHERE id = meeting_id;
END;
$$;

-- Function to get active meeting
CREATE OR REPLACE FUNCTION get_active_meeting()
RETURNS TABLE (
  id UUID,
  name TEXT,
  date DATE,
  description TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.name, m.date, m.description, m.location, m.created_at, m.updated_at
  FROM public.meetings m
  WHERE m.is_active = true
  LIMIT 1;
END;
$$;
