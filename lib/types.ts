// Type definitions for the attendance app
export interface Member {
  id: string
  apartmentNumber: string
  address: string
  name: string
  createdAt?: string
  updatedAt?: string
}

export interface MemberWithAttendance extends Member {
  isPresent: boolean
  markedAt?: string
}

export interface AttendanceRecord {
  id: string
  memberId: string
  meetingId?: string
  isPresent: boolean
  markedAt: string
  clientIp?: string
  userAgent?: string
  createdAt: string
  updatedAt: string
}

export interface ExportData {
  id: string
  name?: string
}

export type ExportFormat = "json" | "csv"
export type ExportType = "present" | "absent"

export interface Meeting {
  id: string
  name: string
  date: string
  description?: string
  location?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface MemberUpload {
  id: string
  apartmentNumber: string
  address: string
  name: string
}

export interface UploadResult {
  success: boolean
  imported: number
  skipped: number
  errors: string[]
}

export interface AdminConfig {
  currentMeeting?: Meeting
  totalMembers: number
  totalPresent: number
  lastSync?: string
}
