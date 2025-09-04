"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, Loader2 } from "lucide-react"
import { ConfirmationDialog } from "./confirmation-dialog"
import { cn } from "@/lib/utils"

interface AttendanceButtonProps {
  memberId: string
  memberName: string
  isPresent: boolean
  onToggle: (memberId: string, isPresent: boolean) => Promise<void>
  disabled?: boolean
}

export function AttendanceButton({
  memberId,
  memberName,
  isPresent,
  onToggle,
  disabled = false,
}: AttendanceButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleClick = async () => {
    if (disabled || isLoading) return

    if (isPresent) {
      setShowConfirmDialog(true)
      return
    }

    await performToggle()
  }

  const performToggle = async () => {
    setIsLoading(true)
    try {
      await onToggle(memberId, !isPresent)
    } catch (error) {
      console.error("Failed to toggle attendance:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmUnmark = async () => {
    await performToggle()
  }

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={disabled || isLoading}
        variant={isPresent ? "default" : "outline"}
        size="sm"
        className={cn(
          "min-w-[140px] transition-all duration-200",
          isPresent
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "border-border hover:bg-accent hover:text-accent-foreground",
        )}
        aria-label={`${isPresent ? "Avmarkera" : "Markera"} närvaro för ${memberName}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uppdaterar...
          </>
        ) : isPresent ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Avmarkera
          </>
        ) : (
          <>
            <Circle className="mr-2 h-4 w-4" />
            Markera närvarande
          </>
        )}
      </Button>

      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Bekräfta avmarkning"
        description={`Är du säker på att du vill avmarkera närvaro för ${memberName}?`}
        confirmText="Ja, avmarkera"
        cancelText="Avbryt"
        onConfirm={handleConfirmUnmark}
        variant="destructive"
      />
    </>
  )
}
