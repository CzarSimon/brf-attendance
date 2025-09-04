"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ExportButton } from "./export-button"
import { RefreshCw } from "lucide-react"
import type { MemberWithAttendance } from "@/lib/types"

interface QuickExportToolbarProps {
  members: MemberWithAttendance[]
  onRefresh?: () => void
  isRefreshing?: boolean
  className?: string
}

export function QuickExportToolbar({ members, onRefresh, isRefreshing = false, className }: QuickExportToolbarProps) {
  const presentMembers = members.filter((m) => m.isPresent)
  const absentMembers = members.filter((m) => !m.isPresent)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {onRefresh && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Uppdatera
          </Button>
          <Separator orientation="vertical" className="h-6" />
        </>
      )}

      <div className="flex items-center gap-2">
        <ExportButton type="present" count={presentMembers.length} disabled={presentMembers.length === 0} />
        <ExportButton type="absent" count={absentMembers.length} disabled={absentMembers.length === 0} />
      </div>
    </div>
  )
}
