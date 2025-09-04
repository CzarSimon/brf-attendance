import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    // Get the active meeting first
    const { data: activeMeeting, error: meetingError } = await supabase
      .from("meetings")
      .select("id")
      .eq("is_active", true)
      .single()

    if (meetingError && meetingError.code !== "PGRST116") {
      console.error("Meeting error:", meetingError)
      return NextResponse.json({ success: false, error: "Failed to fetch active meeting" }, { status: 500 })
    }

    // Build the members query with attendance join
    let query = supabase.from("members").select(`
        id,
        name,
        apartment_number,
        address,
        attendance:attendance!left(
          id,
          is_present,
          marked_at
        )
      `)

    // Filter attendance by active meeting if one exists
    if (activeMeeting) {
      query = query.eq("attendance.meeting_id", activeMeeting.id)
    }

    // Apply search filter if provided
    if (search) {
      query = query.ilike("name", `%${search}%`)
    }

    const { data: members, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch members" }, { status: 500 })
    }

    // Transform the data to match expected format
    const transformedMembers =
      members?.map((member) => ({
        id: member.id,
        name: member.name,
        apartmentNumber: member.apartment_number,
        address: member.address,
        isPresent: member.attendance?.[0]?.is_present || false,
        markedAt: member.attendance?.[0]?.marked_at || null,
      })) || []

    return NextResponse.json({
      success: true,
      data: transformedMembers,
      count: transformedMembers.length,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
