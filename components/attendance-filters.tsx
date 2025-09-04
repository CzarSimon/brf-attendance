"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Filter, X, SortAsc, SortDesc } from "lucide-react"

export interface FilterOptions {
  attendanceStatus: "all" | "present" | "absent"
  sortBy: "name" | "apartmentNumber"
  sortOrder: "asc" | "desc"
  showOnlyPresent: boolean
}

interface AttendanceFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  totalCount: number
  filteredCount: number
  className?: string
}

export function AttendanceFilters({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
  className,
}: AttendanceFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const resetFilters = () => {
    onFiltersChange({
      attendanceStatus: "all",
      sortBy: "name",
      sortOrder: "asc",
      showOnlyPresent: false,
    })
  }

  const hasActiveFilters =
    filters.attendanceStatus !== "all" ||
    filters.sortBy !== "name" ||
    filters.sortOrder !== "desc" ||
    filters.showOnlyPresent

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.attendanceStatus !== "all") count++
    if (filters.showOnlyPresent) count++
    if (filters.sortBy !== "name" || filters.sortOrder !== "asc") count++
    return count
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Filter och sortering</CardTitle>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                {getActiveFilterCount()} aktiva
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground"
            >
              <Filter className="h-4 w-4 mr-1" />
              {isExpanded ? "Dölj" : "Visa"} filter
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground">
                <X className="h-4 w-4 mr-1" />
                Rensa
              </Button>
            )}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Visar {filteredCount} av {totalCount} medlemmar
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Attendance Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Närvarostatus</Label>
              <Select
                value={filters.attendanceStatus}
                onValueChange={(value: "all" | "present" | "absent") => handleFilterChange("attendanceStatus", value)}
              >
                <SelectTrigger className="bg-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla medlemmar</SelectItem>
                  <SelectItem value="present">Endast närvarande</SelectItem>
                  <SelectItem value="absent">Endast frånvarande</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Sortera efter</Label>
              <div className="flex gap-2">
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: "name" | "apartmentNumber") => handleFilterChange("sortBy", value)}
                >
                  <SelectTrigger className="bg-input flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Namn</SelectItem>
                    <SelectItem value="apartmentNumber">Lägenhetsnummer</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc")}
                  className="px-3"
                  aria-label={`Sortera ${filters.sortOrder === "asc" ? "fallande" : "stigande"}`}
                >
                  {filters.sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Snabbfilter</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showOnlyPresent"
                  checked={filters.showOnlyPresent}
                  onCheckedChange={(checked) => handleFilterChange("showOnlyPresent", checked)}
                />
                <Label htmlFor="showOnlyPresent" className="text-sm font-normal cursor-pointer">
                  Visa endast närvarande
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
