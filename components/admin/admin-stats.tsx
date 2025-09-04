import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Users, UserCheck, Clock } from "lucide-react"
import type { AdminConfig } from "@/lib/types"
import { format } from "date-fns"
import { sv } from "date-fns/locale"

interface AdminStatsProps {
  config?: AdminConfig
}

export function AdminStats({ config }: AdminStatsProps) {
  const attendanceRate = config?.totalMembers ? Math.round((config.totalPresent / config.totalMembers) * 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aktiv stämma</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{config?.currentMeeting?.name || "Ingen aktiv"}</div>
          {config?.currentMeeting && (
            <p className="text-xs text-muted-foreground">
              {format(new Date(config.currentMeeting.date), "PPP", { locale: sv })}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Totalt medlemmar</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{config?.totalMembers || 0}</div>
          <p className="text-xs text-muted-foreground">Registrerade medlemmar</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Närvarande</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{config?.totalPresent || 0}</div>
          <p className="text-xs text-muted-foreground">{attendanceRate}% närvarofrekvens</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Senast uppdaterad</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {config?.lastSync ? format(new Date(config.lastSync), "HH:mm") : "--:--"}
          </div>
          <p className="text-xs text-muted-foreground">
            {config?.lastSync ? format(new Date(config.lastSync), "PPP", { locale: sv }) : "Aldrig"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
