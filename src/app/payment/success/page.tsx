"use client"

import { use, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  return (
    <>
      <p className="text-muted-foreground">
        Thank you for your order! We are preparing your items for shipment.
      </p>
      <div className="flex flex-col gap-2">
        {orderId && (
          <Link href={`/orders/${orderId}`}>
            <Button className="w-full gap-2">
              View Order Details
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

export default function PaymentSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="size-12 text-green-600" />
          </div>
          <CardTitle className="text-green-600">Payment Successful!</CardTitle>
          <CardDescription>
            Your payment has been processed successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
            <SuccessContent />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
