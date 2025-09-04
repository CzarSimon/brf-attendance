-- Function to get current attendance status for all members
CREATE OR REPLACE FUNCTION get_members_with_attendance()
RETURNS TABLE (
  id UUID,
  name TEXT,
  apartment_number TEXT,
  address TEXT,
  is_present BOOLEAN,
  marked_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    m.id,
    m.name,
    m.apartment_number,
    m.address,
    COALESCE(a.is_present, false) as is_present,
    a.marked_at
  FROM public.members m
  LEFT JOIN public.attendance a ON m.id = a.member_id
  ORDER BY m.name;
$$;

-- Function to toggle attendance (idempotent)
CREATE OR REPLACE FUNCTION toggle_attendance(
  p_member_id UUID,
  p_is_present BOOLEAN,
  p_client_ip INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  is_present BOOLEAN,
  marked_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_marked_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Insert or update attendance record
  INSERT INTO public.attendance (member_id, is_present, client_ip, user_agent, marked_at)
  VALUES (p_member_id, p_is_present, p_client_ip, p_user_agent, NOW())
  ON CONFLICT (member_id) 
  DO UPDATE SET 
    is_present = EXCLUDED.is_present,
    marked_at = EXCLUDED.marked_at,
    client_ip = EXCLUDED.client_ip,
    user_agent = EXCLUDED.user_agent,
    updated_at = NOW()
  RETURNING marked_at INTO v_marked_at;

  RETURN QUERY SELECT true, p_is_present, v_marked_at;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT false, false, NULL::TIMESTAMP WITH TIME ZONE;
END;
$$;

-- Add unique constraint to prevent duplicate attendance records per member
ALTER TABLE public.attendance ADD CONSTRAINT unique_member_attendance UNIQUE (member_id);
