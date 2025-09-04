import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

// Member interface matching the JSON structure
interface MemberData {
  id: string
  apartmentNumber: string
  address: string
  name: string
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function importMembers(filePath: string) {
  try {
    console.log(`🔄 Starting member import from ${filePath}...`)

    // Read and parse the JSON file
    const fileContent = fs.readFileSync(filePath, "utf-8")
    const membersData: MemberData[] = JSON.parse(fileContent)

    console.log(`📊 Found ${membersData.length} members in file`)

    // Track statistics
    let imported = 0
    let updated = 0
    let skipped = 0
    const duplicateIds = new Set<string>()
    const processedIds = new Set<string>()

    // Process each member
    for (const member of membersData) {
      // Validate required fields
      if (!member.id || !member.name || !member.apartmentNumber || !member.address) {
        console.warn(`⚠️  Skipping invalid member record:`, member)
        skipped++
        continue
      }

      // Check for duplicate IDs within the file
      if (processedIds.has(member.id)) {
        console.warn(`⚠️  Duplicate ID found in file: ${member.id} (${member.name})`)
        duplicateIds.add(member.id)
        skipped++
        continue
      }

      processedIds.add(member.id)

      try {
        // Convert camelCase to snake_case for database
        const dbMember = {
          id: member.id,
          apartment_number: member.apartmentNumber,
          address: member.address,
          name: member.name.trim(),
        }

        // Try to insert, update if exists
        const { data, error } = await supabase
          .from("members")
          .upsert(dbMember, {
            onConflict: "id",
            ignoreDuplicates: false,
          })
          .select("id")

        if (error) {
          console.error(`❌ Error processing member ${member.name} (${member.id}):`, error.message)
          skipped++
          continue
        }

        // Check if this was an insert or update
        const { data: existingMember } = await supabase
          .from("members")
          .select("created_at, updated_at")
          .eq("id", member.id)
          .single()

        if (existingMember && existingMember.created_at !== existingMember.updated_at) {
          updated++
          console.log(`🔄 Updated: ${member.name} (${member.apartmentNumber})`)
        } else {
          imported++
          console.log(`✅ Imported: ${member.name} (${member.apartmentNumber})`)
        }
      } catch (memberError) {
        console.error(`❌ Failed to process member ${member.name}:`, memberError)
        skipped++
      }
    }

    // Print summary
    console.log("\n📈 Import Summary:")
    console.log(`   ✅ Imported: ${imported}`)
    console.log(`   🔄 Updated: ${updated}`)
    console.log(`   ⚠️  Skipped: ${skipped}`)

    if (duplicateIds.size > 0) {
      console.log(`   🚨 Duplicate IDs found: ${duplicateIds.size}`)
      console.log(`      IDs: ${Array.from(duplicateIds).join(", ")}`)
    }

    console.log(`\n🎉 Import completed successfully!`)
  } catch (error) {
    console.error("❌ Import failed:", error)
    process.exit(1)
  }
}

// Main execution
async function main() {
  const filePath = process.argv[2] || path.join(process.cwd(), "data", "members.json")

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`)
    console.log("Usage: npm run import-members [path/to/members.json]")
    process.exit(1)
  }

  await importMembers(filePath)
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

export { importMembers }
