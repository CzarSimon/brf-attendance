// Client-side API functions for the attendance app
import type { MemberWithAttendance, ExportFormat, ExportType } from "./types"

const API_BASE = "/api"

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(data.error || "Request failed", response.status, data.details)
  }

  if (!data.success) {
    throw new ApiError(data.error || "Request failed", response.status)
  }

  return data
}

export const api = {
  // Get all members with attendance status
  async getMembers(search?: string): Promise<{ data: MemberWithAttendance[]; count: number }> {
    const params = new URLSearchParams()
    if (search) params.set("search", search)

    const endpoint = `/members${params.toString() ? `?${params.toString()}` : ""}`
    return apiRequest(endpoint)
  },

  // Toggle member attendance
  async toggleAttendance(
    memberId: string,
    isPresent: boolean,
  ): Promise<{
    data: {
      memberId: string
      memberName: string
      isPresent: boolean
      markedAt: string
    }
  }> {
    return apiRequest("/attendance", {
      method: "POST",
      body: JSON.stringify({ memberId, isPresent }),
    })
  },

  // Get attendance records
  async getAttendance(memberId?: string): Promise<{ data: any[]; count: number }> {
    const params = new URLSearchParams()
    if (memberId) params.set("memberId", memberId)

    const endpoint = `/attendance${params.toString() ? `?${params.toString()}` : ""}`
    return apiRequest(endpoint)
  },

  // Export attendance data
  getExportUrl(type: ExportType, format: ExportFormat, includeName = false): string {
    const params = new URLSearchParams({
      type,
      format,
      includeName: includeName.toString(),
    })

    return `${API_BASE}/export?${params.toString()}`
  },

  // Download export file
  async downloadExport(type: ExportType, format: ExportFormat, includeName = false): Promise<void> {
    const url = this.getExportUrl(type, format, includeName)

    // Create a temporary link and trigger download
    const link = document.createElement("a")
    link.href = url
    link.download = "" // Let the server set the filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },
}
