import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get active meeting
    const { data: activeMeeting } = await supabase.rpc("get_active_meeting")
    const currentMeeting = activeMeeting?.[0] || null

    // Get total members count
    const { count: totalMembers } = await supabase.from("members").select("*", { count: "exact", head: true })

    // Get attendance stats for active meeting
    let totalPresent = 0
    if (currentMeeting) {
      const { data: attendanceData } = await supabase.rpc("get_members_with_attendance", {
        p_meeting_id: currentMeeting.id,
      })

      totalPresent = attendanceData?.filter((member: any) => member.is_present).length || 0
    }

    const config = {
      currentMeeting,
      totalMembers: totalMembers || 0,
      totalPresent,
      lastSync: new Date().toISOString(),
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
