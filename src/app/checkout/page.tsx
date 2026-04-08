"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCart } from "@/lib/store/cart"
import { shippingAddressSchema, type ShippingAddressInput } from "@/lib/validations"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Loader2, ArrowLeft, CreditCard, Wallet, Building2, Store, Smartphone } from "lucide-react"
import Link from "next/link"

const PAYMENT_METHODS = [
  {
    id: "qris",
    label: "QRIS",
    description: "Scan QR code untuk pembayaran instan",
    icon: Smartphone,
    midtransKey: "qris",
  },
  {
    id: "bca",
    label: "Bank BCA",
    description: "Transfer virtual account BCA",
    icon: Building2,
    midtransKey: "bca",
  },
  {
    id: "bri",
    label: "Bank BRI",
    description: "Transfer virtual account BRI",
    icon: Building2,
    midtransKey: "bri",
  },
  {
    id: "bni",
    label: "Bank BNI",
    description: "Transfer virtual account BNI",
    icon: Building2,
    midtransKey: "bni",
  },
  {
    id: "mandiri",
    label: "Bank Mandiri",
    description: "Transfer virtual account Mandiri",
    icon: Building2,
    midtransKey: "mandiri",
  },
  {
    id: "gopay",
    label: "GoPay",
    description: "Bayar dengan saldo GoPay",
    icon: Wallet,
    midtransKey: "gopay",
  },
  {
    id: "shopeepay",
    label: "ShopeePay",
    description: "Bayar dengan saldo ShopeePay",
    icon: Wallet,
    midtransKey: "shopeepay",
  },
  {
    id: "indomaret",
    label: "Indomaret",
    description: "Bayar di gerai Indomaret",
    icon: Store,
    midtransKey: "indomaret",
  },
  {
    id: "alfamart",
    label: "Alfamart",
    description: "Bayar di gerai Alfamart",
    icon: Store,
    midtransKey: "alfamart",
  },
  {
    id: "credit_card",
    label: "Kartu Kredit/Debit",
    description: "Visa, Mastercard, JCB",
    icon: CreditCard,
    midtransKey: "credit_card",
  },
]

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCart((state) => state.items)
  const getTotal = useCart((state) => state.getTotal)
  const clearCart = useCart((state) => state.clearCart)

  const [isLoading, setIsLoading] = useState(false)
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
  const [selectedPayment, setSelectedPayment] = useState<string>("qris")

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart")
    }
  }, [items.length, router])

  const total = getTotal()
  const shippingCost = 15000
  const grandTotal = total + shippingCost

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

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

    if (!selectedPayment) {
      toast.error("Please select a payment method")
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

      // Create order items
      const orderItems = items.map((item) => ({
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
      }))

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

      // Call API to get Midtrans token
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
          paymentMethod: selectedPayment,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create payment transaction")
      }

      const { token } = await response.json()

      // Clear cart
      clearCart()

      // Redirect to payment
      router.push(`/payment/${order.id}?token=${token}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to create order")
    } finally {
      setIsLoading(false)
    }
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
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium">Custom T-Shirt x{item.quantity}</p>
                        <p className="text-muted-foreground">
                          Size: {item.size}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatPrice(item.unit_price * item.quantity)}
                      </p>
                    </div>
                  ))}
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

                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Payment Method</Label>
                  <RadioGroup
                    value={selectedPayment}
                    onValueChange={setSelectedPayment}
                    className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto"
                  >
                    {PAYMENT_METHODS.map((method) => {
                      const Icon = method.icon
                      return (
                        <div
                          key={method.id}
                          className={`flex items-start gap-3 rounded-lg border-2 p-3 cursor-pointer transition-all ${
                            selectedPayment === method.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground/50"
                          }`}
                          onClick={() => setSelectedPayment(method.id)}
                        >
                          <RadioGroupItem
                            value={method.id}
                            id={method.id}
                            className="mt-0.5"
                          />
                          <div className="flex items-center gap-3 flex-1">
                            <Icon className="size-5 text-muted-foreground shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{method.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {method.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </RadioGroup>
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
