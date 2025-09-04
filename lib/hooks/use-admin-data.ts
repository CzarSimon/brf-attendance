"use client"

import { useState, useEffect } from "react"
import type { Meeting, AdminConfig } from "@/lib/types"

export function useAdminData() {
  const [config, setConfig] = useState<AdminConfig>()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    try {
      setIsLoading(true)

      // Fetch admin config
      const configResponse = await fetch("/api/admin/config")
      if (configResponse.ok) {
        const configData = await configResponse.json()
        setConfig(configData.success ? configData.data : configData)
      }

      // Fetch meetings
      const meetingsResponse = await fetch("/api/admin/meetings")
      if (meetingsResponse.ok) {
        const meetingsData = await meetingsResponse.json()
        setMeetings(meetingsData.success ? meetingsData.data : [])
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error)
      setMeetings([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const refreshData = () => {
    fetchData()
  }

  return {
    config,
    meetings,
    isLoading,
    refreshData,
  }
}
