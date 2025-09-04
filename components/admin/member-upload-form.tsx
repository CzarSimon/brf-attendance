"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { UploadResult } from "@/lib/types"

interface MemberUploadFormProps {
  onSuccess?: () => void
}

export function MemberUploadForm({ onSuccess }: MemberUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== "application/json") {
        toast({
          title: "Fel filformat",
          description: "Endast JSON-filer är tillåtna.",
          variant: "destructive",
        })
        return
      }
      setSelectedFile(file)
      setUploadResult(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/admin/upload-members", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const result: UploadResult = await response.json()
      setUploadResult(result)

      if (result.success) {
        toast({
          title: "Uppladdning slutförd",
          description: `${result.imported} medlemmar importerade framgångsrikt.`,
        })
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        onSuccess?.()
      }
    } catch (error) {
      toast({
        title: "Uppladdningsfel",
        description: "Kunde inte ladda upp medlemslistan. Försök igen.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Ladda upp medlemslista
        </CardTitle>
        <CardDescription>
          Importera medlemmar från en JSON-fil. Filen ska innehålla en array med medlemsobjekt.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Välj JSON-fil</Label>
            <Input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </div>

          {selectedFile && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{selectedFile.name}</span>
              <span className="text-xs text-muted-foreground">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}

          <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full">
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Laddar upp...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Ladda upp medlemmar
              </>
            )}
          </Button>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Importerar medlemmar...</span>
            </div>
            <Progress value={undefined} className="w-full" />
          </div>
        )}

        {/* Upload Result */}
        {uploadResult && (
          <Alert className={uploadResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-center gap-2">
              {uploadResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">
                    {uploadResult.success ? "Uppladdning slutförd" : "Uppladdning misslyckades"}
                  </div>
                  <div className="text-sm space-y-1">
                    <div>Importerade: {uploadResult.imported} medlemmar</div>
                    {uploadResult.skipped > 0 && <div>Överhoppade: {uploadResult.skipped} medlemmar</div>}
                    {uploadResult.errors.length > 0 && (
                      <div className="space-y-1">
                        <div className="font-medium">Fel:</div>
                        {uploadResult.errors.map((error, index) => (
                          <div key={index} className="text-xs text-red-600">
                            • {error}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Format Example */}
        <div className="space-y-2">
          <Label>Exempel på filformat:</Label>
          <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
            {`[
  {
    "id": "uuid-here",
    "apartmentNumber": "1203",
    "address": "Harry Martinsons gata 3",
    "name": "Anna Andersson"
  }
]`}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
