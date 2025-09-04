"use client"

import { useState, useCallback } from "react"

interface ConfirmationOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

export function useConfirmationDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmationOptions>({
    title: "",
    description: "",
  })
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((confirmOptions: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(confirmOptions)
      setResolvePromise(() => resolve)
      setIsOpen(true)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(true)
      setResolvePromise(null)
    }
    setIsOpen(false)
  }, [resolvePromise])

  const handleCancel = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(false)
      setResolvePromise(null)
    }
    setIsOpen(false)
  }, [resolvePromise])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && resolvePromise) {
        resolvePromise(false)
        setResolvePromise(null)
      }
      setIsOpen(open)
    },
    [resolvePromise],
  )

  return {
    isOpen,
    options,
    confirm,
    handleConfirm,
    handleCancel,
    handleOpenChange,
  }
}
