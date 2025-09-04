"use client"

import { useMemo } from "react"
import { MemberCard } from "./member-card"
import { LoadingSkeleton } from "./loading-skeleton"
import type { MemberWithAttendance } from "@/lib/types"
import type { FilterOptions } from "./attendance-filters"

interface MemberListProps {
  members: MemberWithAttendance[]
  filters: FilterOptions
  searchQuery: string
  onToggleAttendance: (memberId: string, isPresent: boolean) => Promise<void>
  loading?: boolean
  error?: string | null
}

export function MemberList({
  members,
  filters,
  searchQuery,
  onToggleAttendance,
  loading = false,
  error = null,
}: MemberListProps) {
  const filteredAndSortedMembers = useMemo(() => {
    let filtered = [...members]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(query) ||
          member.apartmentNumber.toLowerCase().includes(query) ||
          member.address.toLowerCase().includes(query),
      )
    }

    // Apply attendance status filter
    if (filters.attendanceStatus === "present") {
      filtered = filtered.filter((member) => member.isPresent)
    } else if (filters.attendanceStatus === "absent") {
      filtered = filtered.filter((member) => !member.isPresent)
    }

    // Apply show only present filter
    if (filters.showOnlyPresent) {
      filtered = filtered.filter((member) => member.isPresent)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0

      if (filters.sortBy === "name") {
        comparison = a.name.localeCompare(b.name, "sv-SE")
      } else if (filters.sortBy === "apartmentNumber") {
        // Sort apartment numbers numerically when possible
        const aNum = Number.parseInt(a.apartmentNumber)
        const bNum = Number.parseInt(b.apartmentNumber)
        if (!isNaN(aNum) && !isNaN(bNum)) {
          comparison = aNum - bNum
        } else {
          comparison = a.apartmentNumber.localeCompare(b.apartmentNumber, "sv-SE")
        }
      }

      return filters.sortOrder === "desc" ? -comparison : comparison
    })

    return filtered
  }, [members, filters, searchQuery])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-2">Ett fel uppstod vid laddning av medlemmar</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (filteredAndSortedMembers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-2">
          {searchQuery.trim() || filters.attendanceStatus !== "all" || filters.showOnlyPresent
            ? "Inga medlemmar matchar dina sökkriterier"
            : "Inga medlemmar hittades"}
        </p>
        {(searchQuery.trim() || filters.attendanceStatus !== "all" || filters.showOnlyPresent) && (
          <p className="text-sm text-muted-foreground">Prova att ändra dina filter eller sökord</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {filteredAndSortedMembers.map((member) => (
        <MemberCard key={member.id} member={member} onToggleAttendance={onToggleAttendance} />
      ))}
    </div>
  )
}
