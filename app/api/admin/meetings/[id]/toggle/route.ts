import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const toggleSchema = z.object({
  isActive: z.boolean(),
})

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const meetingId = params.id

    // Validate request body
    const validation = toggleSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: "Invalid request data" }, { status: 400 })
    }

    const { isActive } = validation.data

    if (isActive) {
      // First deactivate all meetings
      const { error: deactivateError } = await supabase
        .from("meetings")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .neq("id", "00000000-0000-0000-0000-000000000000") // Update all rows

      if (deactivateError) {
        console.error("Database error deactivating meetings:", deactivateError)
        return NextResponse.json({ success: false, error: "Failed to deactivate other meetings" }, { status: 500 })
      }

      // Then activate the specified meeting
      const { error: activateError } = await supabase
        .from("meetings")
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq("id", meetingId)

      if (activateError) {
        console.error("Database error activating meeting:", activateError)
        return NextResponse.json({ success: false, error: "Failed to activate meeting" }, { status: 500 })
      }
    } else {
      // Deactivate the meeting
      const { error } = await supabase
        .from("meetings")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", meetingId)

      if (error) {
        console.error("Database error:", error)
        return NextResponse.json({ success: false, error: "Failed to deactivate meeting" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
