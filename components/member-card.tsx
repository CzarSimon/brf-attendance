"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AttendanceButton } from "./attendance-button"
import type { MemberWithAttendance } from "@/lib/types"
import { cn } from "@/lib/utils"

interface MemberCardProps {
  member: MemberWithAttendance
  onToggleAttendance: (memberId: string, isPresent: boolean) => Promise<void>
  disabled?: boolean
}

export function MemberCard({ member, onToggleAttendance, disabled = false }: MemberCardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        member.isPresent ? "border-primary/20 bg-card" : "border-border bg-card",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-card-foreground truncate">{member.name}</h3>
              <Badge
                variant={member.isPresent ? "default" : "secondary"}
                className={cn(
                  "text-xs",
                  member.isPresent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {member.isPresent ? "Närvarande" : "Frånvarande"}
              </Badge>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="font-medium">Lägenhet:</span>
                <span>{member.apartmentNumber}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium">Adress:</span>
                <span className="truncate">{member.address}</span>
              </p>
              {member.markedAt && (
                <p className="flex items-center gap-2">
                  <span className="font-medium">Markerad:</span>
                  <span>{new Date(member.markedAt).toLocaleString("sv-SE")}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            <AttendanceButton
              memberId={member.id}
              memberName={member.name}
              isPresent={member.isPresent}
              onToggle={onToggleAttendance}
              disabled={disabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
