"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteCustomPrintUpload } from "./actions"

interface DeleteCustomPrintButtonProps {
  printId: string
  fileName: string
}

export function DeleteCustomPrintButton({ printId, fileName }: DeleteCustomPrintButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteCustomPrintUpload(printId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`File "${fileName}" berhasil dihapus`)
      }
    } catch {
      toast.error("Gagal menghapus file")
    } finally {
      setIsDeleting(false)
      setIsOpen(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8"
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="size-3" />
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Upload Cetakan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus file "{fileName}"? Tindakan ini tidak dapat dibatalkan dan akan menghapus file dari storage dan database secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
