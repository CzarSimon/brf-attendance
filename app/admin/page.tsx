"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Users, Settings, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { MeetingConfigForm } from "@/components/admin/meeting-config-form"
import { MemberUploadForm } from "@/components/admin/member-upload-form"
import { AdminStats } from "@/components/admin/admin-stats"
import { MeetingList } from "@/components/admin/meeting-list"
import { useAdminData } from "@/lib/hooks/use-admin-data"

export default function AdminPage() {
  const { config, meetings, isLoading, refreshData } = useAdminData()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Tillbaka till stämman
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Administrationspanel</h1>
            <p className="text-slate-600">Hantera stämmor och medlemslistor för bostadsrättsföreningen</p>
          </div>
          {config?.currentMeeting && (
            <Badge variant="secondary" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              Aktiv stämma: {config.currentMeeting.name}
            </Badge>
          )}
        </div>

        {/* Stats Overview */}
        <AdminStats config={config} />

        {/* Main Content */}
        <Tabs defaultValue="meetings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="meetings" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              Stämmor
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" />
              Medlemmar
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Inställningar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="meetings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MeetingConfigForm onSuccess={refreshData} />
              <MeetingList meetings={meetings} onUpdate={refreshData} />
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <MemberUploadForm onSuccess={refreshData} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Systeminställningar
                </CardTitle>
                <CardDescription>Konfigurera systemets grundinställningar och säkerhet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-slate-600">Inställningar kommer snart...</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
