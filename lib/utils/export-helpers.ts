// Utility functions for export functionality
import type { MemberWithAttendance, ExportData } from "@/lib/types"

export function prepareExportData(
  members: MemberWithAttendance[],
  type: "present" | "absent",
  includeName = true,
): ExportData[] {
  const filteredMembers = members.filter((member) => (type === "present" ? member.isPresent : !member.isPresent))

  return filteredMembers.map((member) => {
    const data: ExportData = { id: member.id }
    if (includeName) {
      data.name = member.name
    }
    return data
  })
}

export function generateFileName(type: "present" | "absent", format: "json" | "csv"): string {
  const timestamp = new Date().toISOString().split("T")[0]
  const typeText = type === "present" ? "narvarande" : "franvarande"
  return `${typeText}-medlemmar-${timestamp}.${format}`
}

export function convertToCSV(data: ExportData[]): string {
  if (data.length === 0) return ""

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(","),
    ...data.map((row) => headers.map((header) => `"${row[header as keyof ExportData] || ""}"`).join(",")),
  ].join("\n")

  return csvContent
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export function validateExportData(data: ExportData[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!Array.isArray(data)) {
    errors.push("Export data must be an array")
    return { isValid: false, errors }
  }

  if (data.length === 0) {
    errors.push("No data to export")
    return { isValid: false, errors }
  }

  // Validate each record
  data.forEach((record, index) => {
    if (!record.id || typeof record.id !== "string") {
      errors.push(`Invalid ID at record ${index + 1}`)
    }
    if (record.name && typeof record.name !== "string") {
      errors.push(`Invalid name at record ${index + 1}`)
    }
  })

  return { isValid: errors.length === 0, errors }
}
