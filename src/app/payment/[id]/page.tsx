"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"

declare global {
  interface Window {
    snap: any
  }
}

export default function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [isLoading, setIsLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending")
  const [orderId, setOrderId] = useState<string>("")

  useEffect(() => {
    const initPayment = async () => {
      const { id } = await params
      setOrderId(id)

      if (!token) {
        setPaymentStatus("failed")
        setIsLoading(false)
        return
      }

      // Load Midtrans Snap script (same pattern as reference repo)
      const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
      const snapScript = isProduction
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js"

      const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY

      // Remove existing script if any
      const existingScript = document.querySelector(`script[src="${snapScript}"]`)
      if (existingScript) {
        existingScript.remove()
      }

      const script = document.createElement("script")
      script.src = snapScript
      script.setAttribute("data-client-key", clientKey || "")
      script.async = true

      script.onload = () => {
        if (window.snap) {
          window.snap.pay(token, {
            onSuccess: function (result: any) {
              setPaymentStatus("success")
              console.log("Payment success:", result)
            },
            onPending: function (result: any) {
              setPaymentStatus("pending")
              console.log("Payment pending:", result)
            },
            onError: function (result: any) {
              setPaymentStatus("failed")
              console.log("Payment error:", result)
            },
            onClose: function () {
              if (paymentStatus === "pending") {
                router.push(`/orders/${id}`)
              }
            },
          })
        }
      }

      script.onerror = () => {
        setIsLoading(false)
        setPaymentStatus("failed")
      }

      document.body.appendChild(script)
      setIsLoading(false)
    }

    initPayment()
  }, [token, params, router, paymentStatus])

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Payment</CardTitle>
          <CardDescription>
            Complete your payment to confirm the order
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Loader2 className="size-16 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Loading payment page...</p>
            </div>
          ) : paymentStatus === "success" ? (
            <div className="space-y-4">
              <CheckCircle className="size-16 mx-auto text-green-500" />
              <div>
                <h3 className="text-xl font-bold text-green-600">Payment Successful!</h3>
                <p className="text-muted-foreground">
                  Your order has been confirmed and is being processed.
                </p>
              </div>
              <Link href={`/orders/${orderId}`}>
                <Button className="w-full">View Order Details</Button>
              </Link>
            </div>
          ) : paymentStatus === "failed" ? (
            <div className="space-y-4">
              <XCircle className="size-16 mx-auto text-destructive" />
              <div>
                <h3 className="text-xl font-bold text-destructive">Payment Failed</h3>
                <p className="text-muted-foreground">
                  Something went wrong with your payment. Please try again.
                </p>
              </div>
              <div className="flex gap-2">
                <Link href="/cart" className="flex-1">
                  <Button variant="outline" className="w-full">Back to Cart</Button>
                </Link>
                <Link href="/checkout" className="flex-1">
                  <Button className="w-full">Try Again</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Clock className="size-16 mx-auto text-yellow-500" />
              <div>
                <h3 className="text-xl font-bold text-yellow-600">Payment Pending</h3>
                <p className="text-muted-foreground">
                  Your payment is being processed. You will receive a confirmation shortly.
                </p>
              </div>
              <Link href={`/orders/${orderId}`}>
                <Button className="w-full">View Order Status</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
