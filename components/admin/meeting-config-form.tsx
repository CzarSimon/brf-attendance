"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarDays, Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MeetingConfigFormProps {
  onSuccess?: () => void
}

export function MeetingConfigForm({ onSuccess }: MeetingConfigFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    description: "",
    location: "",
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to create meeting")
      }

      toast({
        title: "Stämma skapad",
        description: `${formData.name} har skapats framgångsrikt.`,
      })

      setFormData({ name: "", date: "", description: "", location: "" })
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte skapa stämman. Försök igen.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Skapa ny stämma
        </CardTitle>
        <CardDescription>Konfigurera en ny föreningsstämma med datum och detaljer</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Stämmans namn *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="t.ex. Årsstämma 2024"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Datum *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Plats</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="t.ex. Föreningslokalen"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beskrivning</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Ytterligare information om stämman..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Skapar stämma...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Skapa stämma
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
