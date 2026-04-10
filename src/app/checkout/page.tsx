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
import { useCart, type CustomPrintAttachment } from "@/lib/store/cart"
import { shippingAddressSchema, type ShippingAddressInput } from "@/lib/validations"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { uploadOrderImageFromDataUrl, uploadCustomPrintImage } from "@/lib/supabase/storage"
import { Loader2, ArrowLeft, CreditCard, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { formatRupiah, getUnitPrice } from "@/lib/pricing"
import { useLocale } from "@/lib/i18n/locale"
import { t } from "@/lib/i18n/translations"

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
  const { locale } = useLocale()

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
        const tempItemId = `${item.id || Date.now()}`
        const attachments = (item as any).customPrintAttachments as CustomPrintAttachment[] | undefined

        if (attachments && attachments.length > 0) {
          console.log("[Checkout] Processing", attachments.length, "custom print attachment(s)")
        }

        // Upload custom print attachments if present
        const customPrintUrls: string[] = []
        const attachmentDescriptions: string[] = []

        if (attachments && attachments.length > 0) {
          for (const attachment of attachments) {
            try {
              // Convert base64 preview to blob for upload
              const response = await fetch(attachment.preview)
              const blob = await response.blob()
              const file = new File([blob], attachment.fileName, { type: attachment.fileType })

              console.log("[Checkout] Uploading custom print:", attachment.fileName, "size:", attachment.fileSize)
              const imageUrl = await uploadCustomPrintImage(file, session.user.id)
              console.log("[Checkout] Uploaded to:", imageUrl)
              customPrintUrls.push(imageUrl)
              attachmentDescriptions.push(attachment.description || "")

              // Also save to custom_print_uploads table for admin tracking
              const { data: insertData, error: dbError } = await supabase.from("custom_print_uploads").insert({
                user_id: session.user.id,
                file_name: attachment.fileName,
                file_url: imageUrl,
                file_size: attachment.fileSize,
                file_type: attachment.fileType,
                description: attachment.description || null,
                status: "pending",
              }).select()

              if (dbError) {
                console.error("[Checkout] DB Error saving to custom_print_uploads:", JSON.stringify(dbError))
                toast.warning(`Gagal menyimpan ${attachment.fileName} ke dashboard admin`)
              } else {
                console.log("[Checkout] Saved to custom_print_uploads:", JSON.stringify(insertData))
              }
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err)
              console.error("[Checkout] Upload failed:", message)
              toast.error(`Gagal upload ${attachment.fileName}: ${message}`)
            }
          }
        }

        // Handle regular design images
        let mockupUrl: string | null = null
        let originalFrontUrl: string | null = null
        let originalBackUrl: string | null = null

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

        // Build front design URL: if custom print attachments exist, store them as JSON
        // alongside any regular front design data in the existing field
        let frontDesignUrl: string | null = null
        if (item.design.front_design) {
          frontDesignUrl = JSON.stringify({
            design: item.design.front_design,
            custom_print_urls: customPrintUrls.length > 0 ? customPrintUrls : undefined,
            custom_print_descriptions: attachmentDescriptions.length > 0 ? attachmentDescriptions : undefined,
          })
        } else if (customPrintUrls.length > 0) {
          // No front design, but has custom prints - store as JSON in front_design_url
          frontDesignUrl = JSON.stringify({
            custom_print_urls: customPrintUrls,
            custom_print_descriptions: attachmentDescriptions,
          })
        }

        // If no front design but has custom prints, store print URLs in front_design_url as workaround
        if (!frontDesignUrl && customPrintUrls.length > 0) {
          frontDesignUrl = customPrintUrls.join(", ")
        }

        return {
          order_id: order.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tshirt_color: item.design.tshirt_color,
          size: item.size,
          front_design_url: frontDesignUrl,
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
          onSuccess: async function (result: any) {
            console.log("Payment success:", result)

            // Update payment status in database (webhook may not fire in sandbox)
            try {
              const { error: updateError } = await supabase
                .from("payments")
                .update({
                  payment_status: "settlement",
                  midtrans_transaction_id: result.transaction_id,
                  payment_type: result.payment_type,
                  midtrans_response: result,
                  paid_at: result.transaction_time || new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("midtrans_order_id", midtransOrderId)

              if (updateError) {
                console.error("Failed to update payment status:", updateError)
              }

              // Update order status to paid
              const { error: orderUpdateError } = await supabase
                .from("orders")
                .update({
                  status: "paid",
                  updated_at: new Date().toISOString(),
                })
                .eq("id", order.id)

              if (orderUpdateError) {
                console.error("Failed to update order status:", orderUpdateError)
              }

              console.log("Payment and order updated to paid")
            } catch (err) {
              console.error("Error updating payment status:", err)
            }

            clearCart()
            router.push(`/payment/success?orderId=${order.id}`)
          },
          onPending: async function (result: any) {
            console.log("Payment pending:", result)

            // Update payment status
            try {
              await supabase
                .from("payments")
                .update({
                  payment_status: "pending",
                  midtrans_transaction_id: result.transaction_id,
                  payment_type: result.payment_type,
                  midtrans_response: result,
                  updated_at: new Date().toISOString(),
                })
                .eq("midtrans_order_id", midtransOrderId)
            } catch (err) {
              console.error("Error updating payment status:", err)
            }

            clearCart()
            router.push(`/payment/pending?orderId=${order.id}`)
          },
          onError: async function (result: any) {
            console.log("Payment error:", result)

            // Update payment status
            try {
              await supabase
                .from("payments")
                .update({
                  payment_status: "failure",
                  midtrans_transaction_id: result.transaction_id,
                  midtrans_response: result,
                  updated_at: new Date().toISOString(),
                })
                .eq("midtrans_order_id", midtransOrderId)

              await supabase
                .from("orders")
                .update({
                  status: "cancelled",
                  updated_at: new Date().toISOString(),
                })
                .eq("id", order.id)
            } catch (err) {
              console.error("Error updating payment status:", err)
            }

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
            {t("checkout.back", locale)}
          </Button>
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{t("checkout.title", locale)}</h1>
        <p className="text-muted-foreground">
          {t("checkout.desc", locale)}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Details Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("checkout.shipping", locale)}</CardTitle>
                <CardDescription>
                  {t("checkout.shipping.where", locale)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipient_name">{t("checkout.name", locale)} *</Label>
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
                    <Label htmlFor="recipient_phone">{t("checkout.phone", locale)} *</Label>
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
                  <Label htmlFor="shipping_address">{t("checkout.address", locale)} *</Label>
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
                    <Label htmlFor="shipping_city">{t("checkout.city", locale)} *</Label>
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
                    <Label htmlFor="shipping_province">{t("checkout.province", locale)} *</Label>
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
                    <Label htmlFor="shipping_postal_code">{t("checkout.postal", locale)} *</Label>
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
                  <Label htmlFor="notes">{t("checkout.notes", locale)}</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder={t("checkout.notes.placeholder", locale)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>{t("cart.summary", locale)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {totalQty >= 5 && (
                  <Badge variant="secondary" className="w-full justify-center py-2 text-green-700 dark:text-green-400">
                    ✓ Harga {totalQty >= 50 ? "KOMUNITAS" : "BER-5"} {t("cart.price.active", locale)}
                  </Badge>
                )}
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => {
                    const attachments = (item as any).customPrintAttachments as CustomPrintAttachment[] | undefined
                    const sides = item.design.front_design && item.design.back_design ? 2 : 1
                    const { price } = getUnitPrice(totalQty, sides as 1 | 2)

                    return (
                      <div key={item.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <div>
                            <p className="font-medium">Custom T-Shirt x{item.quantity}</p>
                            <p className="text-muted-foreground">
                              {t("orders.size.label", locale)}: {item.size}
                            </p>
                          </div>
                          <p className="font-medium">
                            {formatPrice(price * item.quantity)}
                          </p>
                        </div>

                        {/* Custom Print Attachments */}
                        {attachments && attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {attachments.map((attachment, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs bg-muted rounded-md px-2 py-1.5">
                                <div className="size-8 rounded overflow-hidden flex-shrink-0 bg-white">
                                  <img
                                    src={attachment.preview}
                                    alt={attachment.fileName}
                                    className="size-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium truncate max-w-[120px]">{attachment.fileName}</p>
                                  {attachment.description && (
                                    <p className="text-muted-foreground truncate max-w-[120px]">{attachment.description}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("cart.subtotal", locale)}</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("cart.shipping", locale)}</span>
                    <span>{formatPrice(shippingCost)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t("cart.total", locale)}</span>
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
                      {t("checkout.processing", locale)}
                    </>
                  ) : (
                    <>
                      <CreditCard className="size-4" />
                      {t("checkout.pay", locale)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  {t("checkout.secure", locale)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
