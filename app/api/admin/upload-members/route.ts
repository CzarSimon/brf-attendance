import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

// Validation schema for member data
const memberSchema = z.object({
  id: z.string().uuid("Invalid member ID format"),
  apartmentNumber: z.string().min(1, "Apartment number is required"),
  address: z.string().min(1, "Address is required"),
  name: z.string().min(1, "Name is required"),
})

const membersArraySchema = z.array(memberSchema)

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Parse form data
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    if (file.type !== "application/json") {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only JSON files are allowed." },
        { status: 400 },
      )
    }

    // Read and parse file content
    const fileContent = await file.text()
    let memberData: any[]

    try {
      memberData = JSON.parse(fileContent)
    } catch (parseError) {
      return NextResponse.json({ success: false, error: "Invalid JSON format" }, { status: 400 })
    }

    // Validate member data structure
    const validation = membersArraySchema.safeParse(memberData)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid member data format",
          details: validation.error.errors,
        },
        { status: 400 },
      )
    }

    const members = validation.data
    const errors: string[] = []
    let imported = 0
    let skipped = 0

    // Check for duplicates in the uploaded data
    const uniqueIds = new Set()
    const duplicateIds = new Set()

    for (const member of members) {
      if (uniqueIds.has(member.id)) {
        duplicateIds.add(member.id)
      } else {
        uniqueIds.add(member.id)
      }
    }

    if (duplicateIds.size > 0) {
      errors.push(`Duplicate IDs found in file: ${Array.from(duplicateIds).join(", ")}`)
    }

    // Process each member
    for (const member of members) {
      if (duplicateIds.has(member.id)) {
        skipped++
        continue
      }

      try {
        // Check if member already exists
        const { data: existingMember } = await supabase.from("members").select("id").eq("id", member.id).single()

        if (existingMember) {
          // Update existing member
          const { error: updateError } = await supabase
            .from("members")
            .update({
              apartment_number: member.apartmentNumber,
              address: member.address,
              name: member.name,
              updated_at: new Date().toISOString(),
            })
            .eq("id", member.id)

          if (updateError) {
            errors.push(`Failed to update member ${member.name}: ${updateError.message}`)
            skipped++
          } else {
            imported++
          }
        } else {
          // Insert new member
          const { error: insertError } = await supabase.from("members").insert({
            id: member.id,
            apartment_number: member.apartmentNumber,
            address: member.address,
            name: member.name,
          })

          if (insertError) {
            errors.push(`Failed to insert member ${member.name}: ${insertError.message}`)
            skipped++
          } else {
            imported++
          }
        }
      } catch (memberError) {
        errors.push(`Error processing member ${member.name}: ${memberError}`)
        skipped++
      }
    }

    const result = {
      success: imported > 0,
      imported,
      skipped,
      errors,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
