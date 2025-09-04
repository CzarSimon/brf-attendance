"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  onRetry?: () => void
  showRetry?: boolean
}

export function ErrorDialog({ open, onOpenChange, title, message, onRetry, showRetry = false }: ErrorDialogProps) {
  const handleRetry = () => {
    onRetry?.()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <AlertDialogTitle className="text-left">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left text-muted-foreground">{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <AlertDialogAction onClick={() => onOpenChange(false)}>Stäng</AlertDialogAction>
          {showRetry && onRetry && (
            <AlertDialogAction onClick={handleRetry} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <RefreshCw className="mr-2 h-4 w-4" />
              Försök igen
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
