-- Complete database setup for Swedish housing association attendance app
-- This creates all necessary tables and functions

-- Create meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create members table
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY,
  apartment_number TEXT NOT NULL,
  address TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  is_present BOOLEAN DEFAULT false,
  marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT,
  client_ip TEXT,
  user_agent TEXT,
  UNIQUE(member_id, meeting_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_name ON public.members USING gin(to_tsvector('swedish', name));
CREATE INDEX IF NOT EXISTS idx_members_apartment ON public.members(apartment_number);
CREATE INDEX IF NOT EXISTS idx_attendance_member_meeting ON public.attendance(member_id, meeting_id);
CREATE INDEX IF NOT EXISTS idx_attendance_meeting ON public.attendance(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meetings_active ON public.meetings(is_active) WHERE is_active = true;

-- Function to get members with attendance status for a specific meeting
CREATE OR REPLACE FUNCTION get_members_with_attendance(meeting_uuid UUID)
RETURNS TABLE (
  id UUID,
  apartment_number TEXT,
  address TEXT,
  name TEXT,
  is_present BOOLEAN,
  marked_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.apartment_number,
    m.address,
    m.name,
    COALESCE(a.is_present, false) as is_present,
    a.marked_at
  FROM public.members m
  LEFT JOIN public.attendance a ON m.id = a.member_id AND a.meeting_id = meeting_uuid
  ORDER BY m.name;
END;
$$;

-- Function to toggle attendance
CREATE OR REPLACE FUNCTION toggle_attendance(
  p_member_id UUID,
  p_meeting_id UUID,
  p_updated_by TEXT DEFAULT NULL,
  p_client_ip TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE (
  member_id UUID,
  meeting_id UUID,
  is_present BOOLEAN,
  marked_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
DECLARE
  current_status BOOLEAN;
  new_status BOOLEAN;
BEGIN
  -- Get current attendance status
  SELECT a.is_present INTO current_status
  FROM public.attendance a
  WHERE a.member_id = p_member_id AND a.meeting_id = p_meeting_id;
  
  -- Toggle the status
  new_status := NOT COALESCE(current_status, false);
  
  -- Insert or update attendance record
  INSERT INTO public.attendance (member_id, meeting_id, is_present, updated_by, client_ip, user_agent)
  VALUES (p_member_id, p_meeting_id, new_status, p_updated_by, p_client_ip, p_user_agent)
  ON CONFLICT (member_id, meeting_id)
  DO UPDATE SET 
    is_present = new_status,
    marked_at = NOW(),
    updated_by = p_updated_by,
    client_ip = p_client_ip,
    user_agent = p_user_agent;
  
  -- Return the updated record
  RETURN QUERY
  SELECT a.member_id, a.meeting_id, a.is_present, a.marked_at
  FROM public.attendance a
  WHERE a.member_id = p_member_id AND a.meeting_id = p_meeting_id;
END;
$$;

-- Function to ensure only one active meeting at a time
CREATE OR REPLACE FUNCTION set_active_meeting(meeting_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Deactivate all meetings
  UPDATE public.meetings SET is_active = false;
  
  -- Activate the specified meeting
  UPDATE public.meetings SET is_active = true WHERE id = meeting_uuid;
END;
$$;

-- Function to get active meeting
CREATE OR REPLACE FUNCTION get_active_meeting()
RETURNS TABLE (
  id UUID,
  name TEXT,
  date DATE,
  location TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.name, m.date, m.location, m.description, m.created_at
  FROM public.meetings m
  WHERE m.is_active = true
  LIMIT 1;
END;
$$;

-- Create a default meeting if none exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.meetings LIMIT 1) THEN
    INSERT INTO public.meetings (name, date, location, description, is_active)
    VALUES (
      'Föreningsstämma 2025',
      CURRENT_DATE,
      'Föreningslokalen',
      'Årlig föreningsstämma för bostadsrättsföreningen',
      true
    );
  END IF;
END $$;
