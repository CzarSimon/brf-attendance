-- Add meeting_id to attendance table to support multiple meetings
ALTER TABLE public.attendance 
ADD COLUMN IF NOT EXISTS meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE;

-- Create index for meeting-based queries
CREATE INDEX IF NOT EXISTS idx_attendance_meeting ON public.attendance (meeting_id);

-- Update the unique constraint to include meeting_id
ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_member_id_key;
ALTER TABLE public.attendance ADD CONSTRAINT attendance_member_meeting_unique UNIQUE (member_id, meeting_id);

-- Update the toggle_attendance function to work with meetings
CREATE OR REPLACE FUNCTION toggle_attendance(
  p_member_id UUID,
  p_meeting_id UUID DEFAULT NULL,
  p_client_ip TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE (
  member_id UUID,
  is_present BOOLEAN,
  marked_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_meeting_id UUID;
  v_current_status BOOLEAN;
  v_new_status BOOLEAN;
BEGIN
  -- Get active meeting if no meeting_id provided
  IF p_meeting_id IS NULL THEN
    SELECT m.id INTO v_meeting_id
    FROM public.meetings m
    WHERE m.is_active = true
    LIMIT 1;
    
    IF v_meeting_id IS NULL THEN
      RAISE EXCEPTION 'No active meeting found';
    END IF;
  ELSE
    v_meeting_id := p_meeting_id;
  END IF;

  -- Get current attendance status
  SELECT a.is_present INTO v_current_status
  FROM public.attendance a
  WHERE a.member_id = p_member_id AND a.meeting_id = v_meeting_id;

  -- Toggle the status
  v_new_status := COALESCE(NOT v_current_status, true);

  -- Upsert attendance record
  INSERT INTO public.attendance (member_id, meeting_id, is_present, marked_at, client_ip, user_agent, created_at, updated_at)
  VALUES (p_member_id, v_meeting_id, v_new_status, NOW(), p_client_ip, p_user_agent, NOW(), NOW())
  ON CONFLICT (member_id, meeting_id)
  DO UPDATE SET
    is_present = v_new_status,
    marked_at = NOW(),
    client_ip = p_client_ip,
    user_agent = p_user_agent,
    updated_at = NOW();

  -- Return the result
  RETURN QUERY
  SELECT p_member_id, v_new_status, NOW()::TIMESTAMP WITH TIME ZONE;
END;
$$;

-- Update get_members_with_attendance function to work with meetings
CREATE OR REPLACE FUNCTION get_members_with_attendance(p_meeting_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  apartment_number TEXT,
  address TEXT,
  name TEXT,
  is_present BOOLEAN,
  marked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_meeting_id UUID;
BEGIN
  -- Get active meeting if no meeting_id provided
  IF p_meeting_id IS NULL THEN
    SELECT m.id INTO v_meeting_id
    FROM public.meetings m
    WHERE m.is_active = true
    LIMIT 1;
  ELSE
    v_meeting_id := p_meeting_id;
  END IF;

  RETURN QUERY
  SELECT 
    m.id,
    m.apartment_number,
    m.address,
    m.name,
    COALESCE(a.is_present, false) as is_present,
    a.marked_at,
    m.created_at,
    m.updated_at
  FROM public.members m
  LEFT JOIN public.attendance a ON m.id = a.member_id AND a.meeting_id = v_meeting_id
  ORDER BY m.name;
END;
$$;
