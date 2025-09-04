"use client"

import { useVirtualizer } from "@tanstack/react-virtual"
import { useRef } from "react"
import { MemberCard } from "./member-card"
import type { MemberWithAttendance } from "@/lib/types"

interface VirtualMemberListProps {
  members: MemberWithAttendance[]
  onToggleAttendance: (memberId: string, isPresent: boolean) => Promise<void>
  height?: number
}

export function VirtualMemberList({ members, onToggleAttendance, height = 600 }: VirtualMemberListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: members.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Estimated height of each member card
    overscan: 5,
  })

  if (members.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Inga medlemmar att visa</p>
      </div>
    )
  }

  return (
    <div ref={parentRef} className="overflow-auto border rounded-lg bg-card" style={{ height: `${height}px` }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const member = members[virtualItem.index]
          return (
            <div
              key={virtualItem.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
              className="p-2"
            >
              <MemberCard member={member} onToggleAttendance={onToggleAttendance} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
