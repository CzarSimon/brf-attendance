"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExportButton } from "./export-button"
import { Badge } from "@/components/ui/badge"
import { FileDown, Users, UserCheck, UserX } from "lucide-react"
import type { MemberWithAttendance } from "@/lib/types"

interface ExportPanelProps {
  members: MemberWithAttendance[]
  className?: string
}

export function ExportPanel({ members, className }: ExportPanelProps) {
  const presentMembers = members.filter((m) => m.isPresent)
  const absentMembers = members.filter((m) => !m.isPresent)
  const totalMembers = members.length

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <FileDown className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Exportera listor</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">Ladda ner närvarolistor i JSON eller CSV format</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Totalt</span>
            </div>
            <Badge variant="outline" className="text-sm">
              {totalMembers}
            </Badge>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <UserCheck className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Närvarande</span>
            </div>
            <Badge variant="default" className="text-sm bg-primary">
              {presentMembers.length}
            </Badge>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <UserX className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Frånvarande</span>
            </div>
            <Badge variant="secondary" className="text-sm">
              {absentMembers.length}
            </Badge>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="space-y-3">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-card-foreground">Närvarolista</h4>
            <ExportButton
              type="present"
              count={presentMembers.length}
              disabled={presentMembers.length === 0}
              className="w-full justify-start"
            />
            {presentMembers.length === 0 && (
              <p className="text-xs text-muted-foreground">Inga närvarande medlemmar att exportera</p>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-card-foreground">Frånvarolista</h4>
            <ExportButton
              type="absent"
              count={absentMembers.length}
              disabled={absentMembers.length === 0}
              className="w-full justify-start"
            />
            {absentMembers.length === 0 && (
              <p className="text-xs text-muted-foreground">Inga frånvarande medlemmar att exportera</p>
            )}
          </div>
        </div>

        {/* Export Info */}
        <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
          <h5 className="text-sm font-medium text-accent-foreground mb-2">Exportinformation</h5>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• JSON: Strukturerad data för systemintegration</li>
            <li>• CSV: Kompatibel med Excel och andra kalkylprogram</li>
            <li>• Välj om namn ska inkluderas eller endast ID</li>
            <li>• Filnamn inkluderar datum för enkel identifiering</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
