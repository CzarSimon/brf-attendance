"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Settings } from "lucide-react"
import Link from "next/link"

interface AttendanceHeaderProps {
  title?: string
  subtitle?: string
  meetingDate?: Date
  location?: string
  className?: string
}

export function AttendanceHeader({
  title = "Avprickningslista – Föreningsstämma",
  subtitle = "Markera närvaro för medlemmar",
  meetingDate = new Date(),
  location,
  className,
}: AttendanceHeaderProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("sv-SE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-2xl font-bold text-card-foreground">{title}</CardTitle>
              <Link href="/admin">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Settings className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
            </div>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Badge variant="outline" className="flex items-center gap-1 w-fit">
              <Calendar className="h-3 w-3" />
              {formatDate(meetingDate)}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 w-fit">
              <Clock className="h-3 w-3" />
              {formatTime(meetingDate)}
            </Badge>
            {location && (
              <Badge variant="outline" className="flex items-center gap-1 w-fit">
                <MapPin className="h-3 w-3" />
                {location}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
