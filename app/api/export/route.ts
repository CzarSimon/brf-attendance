import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // 'present' or 'absent'
    const format = searchParams.get("format") // 'json' or 'csv'
    const includeName = searchParams.get("includeName") === "true"

    // Validate parameters
    if (!type || !["present", "absent"].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid type parameter. Must be "present" or "absent"' },
        { status: 400 },
      )
    }

    if (!format || !["json", "csv"].includes(format)) {
      return NextResponse.json(
        { success: false, error: 'Invalid format parameter. Must be "json" or "csv"' },
        { status: 400 },
      )
    }

    // Get members with attendance status
    const { data: members, error } = await supabase.rpc("get_members_with_attendance")

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch member data" }, { status: 500 })
    }

    // Filter based on attendance type
    const filteredMembers =
      members?.filter((member) => {
        return type === "present" ? member.is_present : !member.is_present
      }) || []

    // Prepare export data
    const exportData = filteredMembers.map((member) => {
      const baseData: any = { id: member.id }
      if (includeName) {
        baseData.name = member.name
      }
      return baseData
    })

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0]
    const filename = `${type}-members-${timestamp}.${format}`

    if (format === "json") {
      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      })
    }

    if (format === "csv") {
      // Generate CSV content
      const headers = includeName ? ["id", "name"] : ["id"]
      const csvContent = [
        headers.join(","),
        ...exportData.map((row) => headers.map((header) => `"${row[header] || ""}"`).join(",")),
      ].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      })
    }
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
