"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

function PendingContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  return (
    <>
      <p className="text-muted-foreground">
        We are waiting for payment confirmation. You will receive a notification once the payment is verified.
      </p>
      <div className="flex flex-col gap-2">
        {orderId && (
          <Link href={`/orders/${orderId}`}>
            <Button className="w-full gap-2">
              View Order Status
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        )}
        <Link href="/">
          <Button variant="outline" className="w-full">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </>
  )
}

export default function PaymentPendingPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-yellow-100">
            <Clock className="size-12 text-yellow-600" />
          </div>
          <CardTitle className="text-yellow-600">Payment Pending</CardTitle>
          <CardDescription>
            Your payment is being processed
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
            <PendingContent />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
