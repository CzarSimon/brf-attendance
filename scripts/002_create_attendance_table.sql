-- Create attendance table to track member presence
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  is_present BOOLEAN NOT NULL DEFAULT false,
  marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  client_ip INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendance_member_id ON public.attendance (member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_present ON public.attendance (is_present);
CREATE INDEX IF NOT EXISTS idx_attendance_marked_at ON public.attendance (marked_at);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access for attendance marking (no auth required)
CREATE POLICY "attendance_select_all" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "attendance_insert_all" ON public.attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "attendance_update_all" ON public.attendance FOR UPDATE USING (true);
CREATE POLICY "attendance_delete_all" ON public.attendance FOR DELETE USING (true);
