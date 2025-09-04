"use client"

import { useState, useEffect } from "react"
import type { Meeting } from "@/lib/types"

export function useMeetingData() {
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActiveMeeting = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/admin/config")
      if (!response.ok) {
        throw new Error("Failed to fetch meeting data")
      }

      const data = await response.json()
      setActiveMeeting(data.currentMeeting)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setActiveMeeting(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchActiveMeeting()
  }, [])

  const refetch = () => {
    fetchActiveMeeting()
  }

  return {
    activeMeeting,
    isLoading,
    error,
    refetch,
  }
}
