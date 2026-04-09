"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/store/cart"
import { shippingAddressSchema, type ShippingAddressInput } from "@/lib/validations"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { uploadOrderImageFromDataUrl } from "@/lib/supabase/storage"
import { Loader2, ArrowLeft, CreditCard } from "lucide-react"
import Link from "next/link"
import { formatRupiah, getUnitPrice } from "@/lib/pricing"

declare global {
  interface Window {
    snap: any
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCart((state) => state.items)
  const getTotal = useCart((state) => state.getTotal)
  const getItemCount = useCart((state) => state.getItemCount)
  const clearCart = useCart((state) => state.clearCart)

  const [isLoading, setIsLoading] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [formData, setFormData] = useState({
    recipient_name: "",
    recipient_phone: "",
    shipping_address: "",
    shipping_city: "",
    shipping_province: "",
    shipping_postal_code: "",
    shipping_country: "Indonesia",
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Redirect if cart is empty
  useEffect(() => {
    setIsHydrated(true)
    if (items.length === 0) {
      router.push("/cart")
    }
  }, [items.length, router])

  // Load Midtrans Snap script on mount (same pattern as reference repo)
  useEffect(() => {
    if (!isHydrated) return

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

    document.body.appendChild(script)

    return () => {
      script.remove()
    }
  }, [isHydrated])

  const totalQty = getItemCount()
  const total = getTotal()
  const shippingCost = 15000
  const grandTotal = total + shippingCost

  const formatPrice = (price: number) => formatRupiah(price)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    try {
      shippingAddressSchema.parse(formData)
      setErrors({})
      return true
    } catch (error: any) {
      const fieldErrors: Record<string, string> = {}
      if (error.issues && Array.isArray(error.issues)) {
        error.issues.forEach((err: any) => {
          if (err.path && err.path.length > 0) {
            fieldErrors[err.path[0]] = err.message
          }
        })
      }
      setErrors(fieldErrors)
      return false
    }
  }

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 7)
    return `TC-${timestamp}-${random}`.toUpperCase()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    if (items.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient() as any
      
      // Check if user is authenticated
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        // Save checkout data to localStorage and redirect to login
        localStorage.setItem(
          "checkout-pending",
          JSON.stringify({ formData, items })
        )
        router.push("/auth/login?redirectTo=/checkout")
        return
      }

      // Create order
      const orderNumber = generateOrderNumber()

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: session.user.id,
          order_number: orderNumber,
          status: "pending",
          subtotal: total,
          shipping_cost: shippingCost,
          total: grandTotal,
          ...formData,
        })
        .select()
        .single()

      if (orderError) {
        throw new Error(orderError.message)
      }

      // Create order items with image uploads
      const orderItemsPromises = items.map(async (item) => {
        let mockupUrl: string | null = null
        let originalFrontUrl: string | null = null
        let originalBackUrl: string | null = null

        // Generate a temporary ID for the order item (we'll update it after insert)
        const tempItemId = `${item.id || Date.now()}`

        // Upload mockup image
        if (item.mockupDataUrl) {
          try {
            mockupUrl = await uploadOrderImageFromDataUrl(
              item.mockupDataUrl,
              order.id,
              tempItemId,
              "mockup"
            )
          } catch (err) {
            console.error("Failed to upload mockup:", err)
          }
        }

        // Upload original front design image
        if (item.originalFrontImageDataUrl) {
          try {
            originalFrontUrl = await uploadOrderImageFromDataUrl(
              item.originalFrontImageDataUrl,
              order.id,
              tempItemId,
              "original-front"
            )
          } catch (err) {
            console.error("Failed to upload original front image:", err)
          }
        }

        // Upload original back design image
        if (item.originalBackImageDataUrl) {
          try {
            originalBackUrl = await uploadOrderImageFromDataUrl(
              item.originalBackImageDataUrl,
              order.id,
              tempItemId,
              "original-back"
            )
          } catch (err) {
            console.error("Failed to upload original back image:", err)
          }
        }

        return {
          order_id: order.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tshirt_color: item.design.tshirt_color,
          size: item.size,
          front_design_url: item.design.front_design
            ? JSON.stringify(item.design.front_design)
            : null,
          back_design_url: item.design.back_design
            ? JSON.stringify(item.design.back_design)
            : null,
          preview_url: mockupUrl,
          original_front_image_url: originalFrontUrl,
          original_back_image_url: originalBackUrl,
          mockup_url: mockupUrl,
        }
      })

      const orderItems = await Promise.all(orderItemsPromises)

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems)

      if (itemsError) {
        throw new Error(itemsError.message)
      }

      // Create payment record
      const midtransOrderId = `TC-${Date.now()}`
      
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          order_id: order.id,
          midtrans_order_id: midtransOrderId,
          payment_status: "pending",
          gross_amount: grandTotal,
        })

      if (paymentError) {
        throw new Error(paymentError.message)
      }

      const response = await fetch("/api/payment/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: midtransOrderId,
          amount: grandTotal,
          customerDetails: {
            first_name: formData.recipient_name,
            email: session.user.email,
            phone: formData.recipient_phone,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create payment transaction")
      }

      const { token } = await response.json()

      // Open Midtrans Snap popup immediately (same pattern as reference repo)
      if (typeof window !== "undefined" && window.snap) {
        window.snap.pay(token, {
          onSuccess: function (result: any) {
            console.log("Payment success:", result)
            clearCart()
            router.push(`/payment/success?orderId=${order.id}`)
          },
          onPending: function (result: any) {
            console.log("Payment pending:", result)
            clearCart()
            router.push(`/payment/pending?orderId=${order.id}`)
          },
          onError: function (result: any) {
            console.log("Payment error:", result)
            toast.error("Payment failed. Please try again.")
          },
          onClose: function () {
            console.log("User closed payment popup")
            // User closed popup without completing payment - redirect to orders
            router.push(`/orders/${order.id}`)
          },
        })
      } else {
        // Snap not loaded - redirect to payment page
        clearCart()
        router.push(`/payment/${order.id}?token=${token}`)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create order")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading skeleton until hydrated (prevent hydration mismatch from zustand store)
  if (!isHydrated) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[80vh]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/cart">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="size-4" />
            Back to Cart
          </Button>
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Checkout</h1>
        <p className="text-muted-foreground">
          Enter your shipping details and proceed to payment
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Details Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
                <CardDescription>
                  Where should we deliver your order?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipient_name">Full Name *</Label>
                    <Input
                      id="recipient_name"
                      name="recipient_name"
                      value={formData.recipient_name}
                      onChange={handleInputChange}
                      className={errors.recipient_name ? "border-destructive" : ""}
                    />
                    {errors.recipient_name && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.recipient_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="recipient_phone">Phone Number *</Label>
                    <Input
                      id="recipient_phone"
                      name="recipient_phone"
                      type="tel"
                      value={formData.recipient_phone}
                      onChange={handleInputChange}
                      className={errors.recipient_phone ? "border-destructive" : ""}
                    />
                    {errors.recipient_phone && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.recipient_phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="shipping_address">Street Address *</Label>
                  <Textarea
                    id="shipping_address"
                    name="shipping_address"
                    value={formData.shipping_address}
                    onChange={handleInputChange}
                    rows={3}
                    className={errors.shipping_address ? "border-destructive" : ""}
                  />
                  {errors.shipping_address && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.shipping_address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="shipping_city">City *</Label>
                    <Input
                      id="shipping_city"
                      name="shipping_city"
                      value={formData.shipping_city}
                      onChange={handleInputChange}
                      className={errors.shipping_city ? "border-destructive" : ""}
                    />
                    {errors.shipping_city && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.shipping_city}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="shipping_province">Province *</Label>
                    <Input
                      id="shipping_province"
                      name="shipping_province"
                      value={formData.shipping_province}
                      onChange={handleInputChange}
                      className={errors.shipping_province ? "border-destructive" : ""}
                    />
                    {errors.shipping_province && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.shipping_province}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="shipping_postal_code">Postal Code *</Label>
                    <Input
                      id="shipping_postal_code"
                      name="shipping_postal_code"
                      value={formData.shipping_postal_code}
                      onChange={handleInputChange}
                      className={errors.shipping_postal_code ? "border-destructive" : ""}
                    />
                    {errors.shipping_postal_code && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.shipping_postal_code}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Any special instructions for your order?"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {totalQty >= 5 && (
                  <Badge variant="secondary" className="w-full justify-center py-2 text-green-700 dark:text-green-400">
                    ✓ Harga {totalQty >= 50 ? "KOMUNITAS" : "BER-5"} aktif
                  </Badge>
                )}
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => {
                    const sides = item.design.front_design && item.design.back_design ? 2 : 1
                    const { price } = getUnitPrice(totalQty, sides as 1 | 2)
                    return (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div>
                          <p className="font-medium">Custom T-Shirt x{item.quantity}</p>
                          <p className="text-muted-foreground">
                            Size: {item.size}
                          </p>
                        </div>
                        <p className="font-medium">
                          {formatPrice(price * item.quantity)}
                        </p>
                      </div>
                    )
                  })}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{formatPrice(shippingCost)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="size-4" />
                      Proceed to Payment
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Secure payment powered by Midtrans
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
