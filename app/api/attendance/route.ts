import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

// Validation schema for attendance toggle
const attendanceSchema = z.object({
  memberId: z.string().uuid("Invalid member ID format"),
  isPresent: z.boolean(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Validate request body
    const validation = attendanceSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: validation.error.errors,
        },
        { status: 400 },
      )
    }

    const { memberId, isPresent } = validation.data

    // Get client IP and user agent for audit trail
    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Verify member exists
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("id, name")
      .eq("id", memberId)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 })
    }

    // Get the active meeting
    const { data: activeMeeting, error: meetingError } = await supabase
      .from("meetings")
      .select("id")
      .eq("is_active", true)
      .single()

    if (meetingError || !activeMeeting) {
      return NextResponse.json({ success: false, error: "No active meeting found" }, { status: 400 })
    }

    // Check if attendance record exists
    const { data: existingAttendance } = await supabase
      .from("attendance")
      .select("*")
      .eq("member_id", memberId)
      .eq("meeting_id", activeMeeting.id)
      .single()

    let result
    if (existingAttendance) {
      // Update existing attendance record
      const { data, error } = await supabase
        .from("attendance")
        .update({
          is_present: isPresent,
          marked_at: new Date().toISOString(),
          updated_by: `${clientIp} - ${userAgent}`,
        })
        .eq("member_id", memberId)
        .eq("meeting_id", activeMeeting.id)
        .select()
        .single()

      if (error) {
        console.error("Database error:", error)
        return NextResponse.json({ success: false, error: "Failed to update attendance" }, { status: 500 })
      }
      result = data
    } else {
      // Create new attendance record
      const { data, error } = await supabase
        .from("attendance")
        .insert({
          member_id: memberId,
          meeting_id: activeMeeting.id,
          is_present: isPresent,
          marked_at: new Date().toISOString(),
          updated_by: `${clientIp} - ${userAgent}`,
        })
        .select()
        .single()

      if (error) {
        console.error("Database error:", error)
        return NextResponse.json({ success: false, error: "Failed to create attendance" }, { status: 500 })
      }
      result = data
    }

    return NextResponse.json({
      success: true,
      data: {
        memberId,
        memberName: member.name,
        isPresent: result.is_present,
        markedAt: result.marked_at,
      },
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get("memberId")

    if (memberId) {
      // Get attendance for specific member
      const { data, error } = await supabase
        .from("attendance")
        .select(`
          *,
          members (
            name,
            apartment_number,
            address
          )
        `)
        .eq("member_id", memberId)
        .single()

      if (error) {
        return NextResponse.json({ success: false, error: "Attendance record not found" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data,
      })
    }

    // Get all attendance records
    const { data, error } = await supabase
      .from("attendance")
      .select(`
        *,
        members (
          name,
          apartment_number,
          address
        )
      `)
      .order("marked_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch attendance records" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
