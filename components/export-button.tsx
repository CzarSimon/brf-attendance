"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Download, FileText, FileSpreadsheet, ChevronDown, Loader2 } from "lucide-react"
import { api } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import type { ExportType, ExportFormat } from "@/lib/types"

interface ExportButtonProps {
  type: ExportType
  count: number
  disabled?: boolean
  className?: string
}

export function ExportButton({ type, count, disabled = false, className }: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [includeName, setIncludeName] = useState(true)
  const { toast } = useToast()

  const handleExport = async (format: ExportFormat) => {
    if (disabled || isLoading || count === 0) return

    setIsLoading(true)
    try {
      await api.downloadExport(type, format, includeName)

      toast({
        title: "Export slutförd",
        description: `${type === "present" ? "Närvarolistan" : "Frånvarolistan"} har laddats ner som ${format.toUpperCase()}.`,
      })
    } catch (error) {
      console.error("Export failed:", error)
      toast({
        title: "Export misslyckades",
        description: "Ett fel uppstod vid nedladdning av filen. Försök igen.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const buttonText = type === "present" ? "Ladda ner närvarolista" : "Ladda ner frånvarolista"
  const buttonIcon = type === "present" ? FileText : FileSpreadsheet

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || isLoading || count === 0} className={className}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          {buttonText}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="p-3">
          <div className="flex items-center space-x-2 mb-3">
            <Checkbox id={`include-name-${type}`} checked={includeName} onCheckedChange={setIncludeName} />
            <Label htmlFor={`include-name-${type}`} className="text-sm font-normal">
              Inkludera namn i export
            </Label>
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            {count} {type === "present" ? "närvarande" : "frånvarande"} medlemmar
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleExport("json")}
          disabled={isLoading || count === 0}
          className="cursor-pointer"
        >
          <FileText className="mr-2 h-4 w-4" />
          Ladda ner som JSON
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("csv")}
          disabled={isLoading || count === 0}
          className="cursor-pointer"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Ladda ner som CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
