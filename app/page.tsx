"use client"

import { useState, useCallback } from "react"
import { AttendanceHeader } from "@/components/attendance-header"
import { AttendanceStats } from "@/components/attendance-stats"
import { AttendanceFilters, type FilterOptions } from "@/components/attendance-filters"
import { SearchBar } from "@/components/search-bar"
import { MemberList } from "@/components/member-list"
import { ExportPanel } from "@/components/export-panel"
import { QuickExportToolbar } from "@/components/quick-export-toolbar"
import { ErrorDialog } from "@/components/error-dialog"
import { useMembers } from "@/lib/hooks/use-members"
import { useAttendanceFilters } from "@/lib/hooks/use-attendance-filters"
import { useMeetingData } from "@/lib/hooks/use-meeting-data"
import { ApiError } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

const defaultFilters: FilterOptions = {
  attendanceStatus: "all",
  sortBy: "name",
  sortOrder: "asc",
  showOnlyPresent: false,
}

export default function AttendancePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: "",
    message: "",
  })

  const { activeMeeting, isLoading: meetingLoading } = useMeetingData()
  const { members, loading, error, refetch, toggleAttendance } = useMembers(searchQuery)
  const { filters, setFilters, filteredMembers, totalCount, filteredCount } = useAttendanceFilters(members, searchQuery)
  const { toast } = useToast()

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleToggleAttendance = async (memberId: string, isPresent: boolean) => {
    try {
      await toggleAttendance(memberId, isPresent)
      toast({
        title: "Närvaro uppdaterad",
        description: `Medlemmens närvaro har ${isPresent ? "markerats" : "avmarkerats"}.`,
      })
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : "Ett oväntat fel uppstod"
      setErrorDialog({
        open: true,
        title: "Fel vid uppdatering av närvaro",
        message: errorMessage,
      })
    }
  }

  const handleRefresh = () => {
    refetch()
    toast({
      title: "Uppdaterad",
      description: "Medlemslistan har uppdaterats.",
    })
  }

  if (meetingLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Laddar stämmoinformation...</p>
        </div>
      </div>
    )
  }

  if (!activeMeeting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-foreground">Ingen aktiv stämma</h1>
          <p className="text-muted-foreground">
            Det finns ingen aktiv stämma för närvarande. Kontakta administratören för att aktivera en stämma.
          </p>
          <a
            href="/admin"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Gå till administrationspanel
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <AttendanceHeader
          title={activeMeeting.name}
          subtitle={activeMeeting.description || "Markera närvaro för medlemmar"}
          meetingDate={new Date(activeMeeting.date)}
          location={activeMeeting.location}
        />

        {/* Stats */}
        <AttendanceStats members={filteredMembers} totalMembers={members} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search and Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Search Bar */}
              <SearchBar onSearch={handleSearch} className="w-full sm:flex-1 sm:max-w-md" />
              <QuickExportToolbar
                members={filteredMembers}
                onRefresh={handleRefresh}
                isRefreshing={loading}
                className="flex-shrink-0"
              />
            </div>

            {/* Filters */}
            <AttendanceFilters
              filters={filters}
              onFiltersChange={setFilters}
              totalCount={totalCount}
              filteredCount={filteredCount}
            />

            {/* Member List */}
            <MemberList
              members={members}
              filters={filters}
              searchQuery={searchQuery}
              onToggleAttendance={handleToggleAttendance}
              loading={loading}
              error={error}
            />
          </div>

          {/* Right Column - Export Panel */}
          <div className="lg:col-span-1">
            <ExportPanel members={filteredMembers} className="sticky top-6" />
          </div>
        </div>
      </div>

      {/* Error Dialog */}
      <ErrorDialog
        open={errorDialog.open}
        onOpenChange={(open) => setErrorDialog((prev) => ({ ...prev, open }))}
        title={errorDialog.title}
        message={errorDialog.message}
        onRetry={handleRefresh}
        showRetry={true}
      />
    </div>
  )
}
