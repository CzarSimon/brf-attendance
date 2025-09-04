"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserX } from "lucide-react"
import type { MemberWithAttendance } from "@/lib/types"

interface AttendanceStatsProps {
  members: MemberWithAttendance[]
  totalMembers?: MemberWithAttendance[]
}

export function AttendanceStats({ members, totalMembers }: AttendanceStatsProps) {
  const allMembers = totalMembers || members
  const totalMembersCount = allMembers.length
  const presentMembers = members.filter((m) => m.isPresent).length
  const absentMembers = members.filter((m) => !m.isPresent).length
  const attendanceRate =
    totalMembersCount > 0 ? Math.round((allMembers.filter((m) => m.isPresent).length / totalMembersCount) * 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Totalt antal medlemmar</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-card-foreground">{totalMembersCount}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Närvarande</CardTitle>
          <UserCheck className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{presentMembers}</div>
          {totalMembers && members.length !== totalMembers.length && (
            <div className="text-xs text-muted-foreground mt-1">av {members.length} visade</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Frånvarande</CardTitle>
          <UserX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-muted-foreground">{absentMembers}</div>
          {totalMembers && members.length !== totalMembers.length && (
            <div className="text-xs text-muted-foreground mt-1">av {members.length} visade</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Närvarograd</CardTitle>
          <div className="h-4 w-4 rounded-full bg-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-card-foreground">{attendanceRate}%</div>
        </CardContent>
      </Card>
    </div>
  )
}
