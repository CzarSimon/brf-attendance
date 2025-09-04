import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

// Validation schema for meeting creation
const meetingSchema = z.object({
  name: z.string().min(1, "Meeting name is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  description: z.string().optional(),
  location: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Validate request body
    const validation = meetingSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid meeting data",
          details: validation.error.errors,
        },
        { status: 400 },
      )
    }

    const { name, date, description, location } = validation.data

    // Insert new meeting
    const { data: meeting, error } = await supabase
      .from("meetings")
      .insert({
        name,
        date,
        description: description || null,
        location: location || null,
        is_active: false,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ success: false, error: "Failed to create meeting" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: meeting,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: meetings, error } = await supabase.from("meetings").select("*").order("date", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch meetings" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: meetings || [],
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
