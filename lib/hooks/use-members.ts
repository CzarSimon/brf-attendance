"use client"

import { useState, useEffect } from "react"
import { api, ApiError } from "@/lib/api-client"
import type { MemberWithAttendance } from "@/lib/types"

export function useMembers(searchQuery?: string) {
  const [members, setMembers] = useState<MemberWithAttendance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = async (search?: string) => {
    try {
      setLoading(true)
      setError(null)
      const result = await api.getMembers(search)
      setMembers(result.data)
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to fetch members"
      setError(errorMessage)
      console.error("Error fetching members:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers(searchQuery)
  }, [searchQuery])

  const toggleAttendance = async (memberId: string, isPresent: boolean) => {
    try {
      const result = await api.toggleAttendance(memberId, isPresent)

      // Optimistically update the local state
      setMembers((prev) =>
        prev.map((member) =>
          member.id === memberId
            ? { ...member, isPresent: result.data.isPresent, markedAt: result.data.markedAt }
            : member,
        ),
      )

      return result.data
    } catch (err) {
      // Rollback optimistic update on error
      await fetchMembers(searchQuery)
      throw err
    }
  }

  return {
    members,
    loading,
    error,
    refetch: () => fetchMembers(searchQuery),
    toggleAttendance,
  }
}
