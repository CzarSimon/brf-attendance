"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, Play, Pause } from "lucide-react"
import type { Meeting } from "@/lib/types"
import { format } from "date-fns"
import { sv } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface MeetingListProps {
  meetings: Meeting[]
  onUpdate?: () => void
}

export function MeetingList({ meetings, onUpdate }: MeetingListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleToggleActive = async (meetingId: string, isActive: boolean) => {
    setLoadingId(meetingId)

    try {
      const response = await fetch(`/api/admin/meetings/${meetingId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (!response.ok) {
        throw new Error("Failed to toggle meeting")
      }

      toast({
        title: isActive ? "Stämma inaktiverad" : "Stämma aktiverad",
        description: isActive
          ? "Stämman är nu inaktiv och syns inte för medlemmarna."
          : "Stämman är nu aktiv och medlemmar kan registrera närvaro.",
      })

      onUpdate?.()
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera stämman. Försök igen.",
        variant: "destructive",
      })
    } finally {
      setLoadingId(null)
    }
  }

  if (meetings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Befintliga stämmor</CardTitle>
          <CardDescription>Hantera och aktivera stämmor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Inga stämmor skapade ännu</p>
            <p className="text-sm">Skapa din första stämma för att komma igång</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Befintliga stämmor</CardTitle>
        <CardDescription>Hantera och aktivera stämmor</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{meeting.name}</h4>
                {meeting.isActive && (
                  <Badge variant="default" className="text-xs">
                    Aktiv
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {format(new Date(meeting.date), "PPP", { locale: sv })}
                </div>
                {meeting.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {meeting.location}
                  </div>
                )}
              </div>
              {meeting.description && <p className="text-sm text-muted-foreground">{meeting.description}</p>}
            </div>

            <Button
              variant={meeting.isActive ? "secondary" : "default"}
              size="sm"
              onClick={() => handleToggleActive(meeting.id, meeting.isActive)}
              disabled={loadingId === meeting.id}
              className="gap-2"
            >
              {meeting.isActive ? (
                <>
                  <Pause className="h-4 w-4" />
                  Inaktivera
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Aktivera
                </>
              )}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
