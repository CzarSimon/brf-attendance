import fs from "fs"
import path from "path"

interface MemberData {
  id: string
  apartmentNumber: string
  address: string
  name: string
}

function validateMembersFile(filePath: string): {
  isValid: boolean
  errors: string[]
  warnings: string[]
  stats: {
    total: number
    valid: number
    duplicateIds: number
  }
} {
  const errors: string[] = []
  const warnings: string[] = []
  let validCount = 0
  const seenIds = new Set<string>()
  const duplicateIds = new Set<string>()

  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      errors.push(`File not found: ${filePath}`)
      return {
        isValid: false,
        errors,
        warnings,
        stats: { total: 0, valid: 0, duplicateIds: 0 },
      }
    }

    // Read and parse JSON
    const fileContent = fs.readFileSync(filePath, "utf-8")
    let membersData: any[]

    try {
      membersData = JSON.parse(fileContent)
    } catch (parseError) {
      errors.push(`Invalid JSON format: ${parseError}`)
      return {
        isValid: false,
        errors,
        warnings,
        stats: { total: 0, valid: 0, duplicateIds: 0 },
      }
    }

    // Check if it's an array
    if (!Array.isArray(membersData)) {
      errors.push("JSON must contain an array of members")
      return {
        isValid: false,
        errors,
        warnings,
        stats: { total: 0, valid: 0, duplicateIds: 0 },
      }
    }

    // Validate each member
    membersData.forEach((member, index) => {
      const memberErrors: string[] = []

      // Check required fields
      if (!member.id || typeof member.id !== "string") {
        memberErrors.push(`Missing or invalid 'id' field`)
      }
      if (!member.name || typeof member.name !== "string") {
        memberErrors.push(`Missing or invalid 'name' field`)
      }
      if (!member.apartmentNumber || typeof member.apartmentNumber !== "string") {
        memberErrors.push(`Missing or invalid 'apartmentNumber' field`)
      }
      if (!member.address || typeof member.address !== "string") {
        memberErrors.push(`Missing or invalid 'address' field`)
      }

      // Check for duplicate IDs
      if (member.id && seenIds.has(member.id)) {
        duplicateIds.add(member.id)
        warnings.push(`Duplicate ID at index ${index}: ${member.id} (${member.name || "unknown"})`)
      } else if (member.id) {
        seenIds.add(member.id)
      }

      // Validate ID format (should be UUID)
      if (member.id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(member.id)) {
        warnings.push(`Invalid UUID format at index ${index}: ${member.id}`)
      }

      if (memberErrors.length > 0) {
        errors.push(`Member at index ${index}: ${memberErrors.join(", ")}`)
      } else {
        validCount++
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      stats: {
        total: membersData.length,
        valid: validCount,
        duplicateIds: duplicateIds.size,
      },
    }
  } catch (error) {
    errors.push(`Unexpected error: ${error}`)
    return {
      isValid: false,
      errors,
      warnings,
      stats: { total: 0, valid: 0, duplicateIds: 0 },
    }
  }
}

// Main execution for CLI usage
async function main() {
  const filePath = process.argv[2] || path.join(process.cwd(), "data", "members.json")

  console.log(`🔍 Validating members file: ${filePath}`)

  const result = validateMembersFile(filePath)

  console.log("\n📊 Validation Results:")
  console.log(`   Total members: ${result.stats.total}`)
  console.log(`   Valid members: ${result.stats.valid}`)
  console.log(`   Duplicate IDs: ${result.stats.duplicateIds}`)

  if (result.warnings.length > 0) {
    console.log("\n⚠️  Warnings:")
    result.warnings.forEach((warning) => console.log(`   ${warning}`))
  }

  if (result.errors.length > 0) {
    console.log("\n❌ Errors:")
    result.errors.forEach((error) => console.log(`   ${error}`))
    process.exit(1)
  } else {
    console.log("\n✅ File is valid and ready for import!")
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

export { validateMembersFile }
