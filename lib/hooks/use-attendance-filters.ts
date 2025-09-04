"use client"

import { useState, useMemo } from "react"
import type { MemberWithAttendance } from "@/lib/types"
import type { FilterOptions } from "@/components/attendance-filters"

const defaultFilters: FilterOptions = {
  attendanceStatus: "all",
  sortBy: "name",
  sortOrder: "asc",
  showOnlyPresent: false,
}

export function useAttendanceFilters(members: MemberWithAttendance[], searchQuery: string) {
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters)

  const filteredMembers = useMemo(() => {
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

  const resetFilters = () => {
    setFilters(defaultFilters)
  }

  return {
    filters,
    setFilters,
    resetFilters,
    filteredMembers,
    totalCount: members.length,
    filteredCount: filteredMembers.length,
  }
}
