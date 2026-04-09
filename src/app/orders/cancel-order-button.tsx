"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Ban } from "lucide-react"
import { toast } from "sonner"
import { cancelOrder } from "@/app/admin/actions"

export function CancelOrderButton({ orderId, orderNumber }: { orderId: string; orderNumber: string }) {
  const router = useRouter()
  const [isCancelling, setIsCancelling] = useState(false)
  const [open, setOpen] = useState(false)

  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      await cancelOrder(orderId)
      toast.success(`Order ${orderNumber} has been cancelled`)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel order")
    } finally {
      setIsCancelling(false)
      setOpen(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => setOpen(true)}
      >
        <Ban className="size-4" />
        Cancel This Order
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel order <strong>{orderNumber}</strong>? This action cannot
              be undone. If you have already paid, you may need to contact support for a refund.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Yes, Cancel Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
