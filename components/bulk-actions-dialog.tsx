"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, UserCheck, UserX, Loader2 } from "lucide-react"
import type { MemberWithAttendance } from "@/lib/types"

interface BulkActionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: MemberWithAttendance[]
  action: "mark-present" | "mark-absent"
  onConfirm: (memberIds: string[]) => Promise<void>
}

export function BulkActionsDialog({ open, onOpenChange, members, action, onConfirm }: BulkActionsDialogProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const eligibleMembers = members.filter((member) => (action === "mark-present" ? !member.isPresent : member.isPresent))

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMembers(eligibleMembers.map((m) => m.id))
    } else {
      setSelectedMembers([])
    }
  }

  const handleMemberToggle = (memberId: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers((prev) => [...prev, memberId])
    } else {
      setSelectedMembers((prev) => prev.filter((id) => id !== memberId))
    }
  }

  const handleConfirm = async () => {
    if (selectedMembers.length === 0) return

    setIsLoading(true)
    try {
      await onConfirm(selectedMembers)
      setSelectedMembers([])
      onOpenChange(false)
    } catch (error) {
      console.error("Bulk action failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const actionText = action === "mark-present" ? "Markera närvarande" : "Markera frånvarande"
  const actionIcon = action === "mark-present" ? UserCheck : UserX
  const ActionIcon = actionIcon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ActionIcon className="h-5 w-5" />
            {actionText}
          </DialogTitle>
          <DialogDescription>
            Välj medlemmar som ska {action === "mark-present" ? "markeras närvarande" : "markeras frånvarande"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedMembers.length === eligibleMembers.length && eligibleMembers.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="text-sm font-medium">
                Välj alla ({eligibleMembers.length})
              </Label>
            </div>
            <Badge variant="outline">{selectedMembers.length} valda</Badge>
          </div>

          <ScrollArea className="h-48 w-full border rounded-md p-2">
            <div className="space-y-2">
              {eligibleMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded">
                  <Checkbox
                    id={`member-${member.id}`}
                    checked={selectedMembers.includes(member.id)}
                    onCheckedChange={(checked) => handleMemberToggle(member.id, !!checked)}
                  />
                  <Label htmlFor={`member-${member.id}`} className="flex-1 cursor-pointer">
                    <div className="font-medium">{member.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {member.apartmentNumber} • {member.address}
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>

          {eligibleMembers.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Inga medlemmar att {action === "mark-present" ? "markera närvarande" : "markera frånvarande"}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Avbryt
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedMembers.length === 0 || isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uppdaterar...
              </>
            ) : (
              `${actionText} (${selectedMembers.length})`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
