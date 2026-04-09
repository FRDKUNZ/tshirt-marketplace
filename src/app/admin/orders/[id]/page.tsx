import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Package, MapPin, CreditCard, ShoppingBag, User, Image as ImageIcon, Trash2 } from "lucide-react"
import { DeleteOrderButton } from "../../delete-order-button"

const ORDER_STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"] as const

async function updateOrderStatus(formData: FormData) {
  "use server"

  await requireAdmin()

  const orderId = formData.get("orderId") as string
  const status = formData.get("status") as string

  const supabase = await createClient() as any

  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/admin")
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()

  const { id } = await params
  const supabase = await createClient() as any

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single()

  if (!order) {
    notFound()
  }

  const { data: orderItems } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id)

  const { data: payment } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", id)
    .single()

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", order.user_id)
    .single()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      paid: "default",
      processing: "default",
      shipped: "outline",
      delivered: "default",
      cancelled: "destructive",
      refunded: "destructive",
    }
    return variants[status] || "secondary"
  }

  const TSHIRT_COLORS: Record<string, string> = {
    "#ffffff": "White",
    "#000000": "Black",
    "#1e3a5f": "Navy",
    "#dc2626": "Red",
    "#2563eb": "Royal Blue",
    "#16a34a": "Forest Green",
    "#6b7280": "Gray",
    "#7c3aed": "Purple",
    "#ec4899": "Pink",
    "#ea580c": "Orange",
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <Link href="/admin">
          <Button variant="ghost" className="gap-2 mb-4 h-10 min-h-[44px]">
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold truncate">{order.order_number}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Placed on {new Date(order.created_at!).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant={getStatusBadge(order.status || "pending")} className="text-sm px-3 py-1.5">
                {order.status}
              </Badge>
              <DeleteOrderButton orderId={order.id} orderNumber={order.order_number} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Update Status Form */}
          <Card>
            <CardHeader>
              <CardTitle>Update Order Status</CardTitle>
              <CardDescription>
                Change the order status and notify the customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateOrderStatus} className="flex flex-col sm:flex-row gap-3">
                <input type="hidden" name="orderId" value={order.id} />
                <div className="flex-1">
                  <Select name="status" defaultValue={order.status || "pending"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="sm:w-auto w-full h-10 min-h-[44px]">Update Status</Button>
              </form>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="size-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems?.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">Custom T-Shirt</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="size-4 rounded border"
                              style={{ backgroundColor: item.tshirt_color }}
                            />
                            {TSHIRT_COLORS[item.tshirt_color] || item.tshirt_color}
                          </div>
                        </TableCell>
                        <TableCell>{item.size}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatPrice(item.unit_price)}</TableCell>
                        <TableCell className="font-semibold">
                          {formatPrice(item.unit_price * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {orderItems?.map((item: any) => (
                  <Card key={item.id} className="border-2">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">Custom T-Shirt</p>
                        <p className="text-lg font-bold">{formatPrice(item.unit_price * item.quantity)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div
                            className="size-4 rounded border flex-shrink-0"
                            style={{ backgroundColor: item.tshirt_color }}
                          />
                          <span className="text-muted-foreground">{TSHIRT_COLORS[item.tshirt_color] || item.tshirt_color}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">Size: {item.size}</Badge>
                        <Badge variant="secondary" className="text-xs">Qty: {item.quantity}</Badge>
                        <span className="text-xs text-muted-foreground self-center">{formatPrice(item.unit_price)}/pc</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Design Images for Sablon */}
              {orderItems?.some((item: any) => item.mockup_url || item.original_front_image_url || item.original_back_image_url) && (
                <div className="mt-6 md:mt-8 space-y-6">
                  <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
                    <ImageIcon className="size-5" />
                    Design Images for Printing
                  </h3>

                  {orderItems.map((item: any, index: number) => (
                    <div key={item.id} className="space-y-4">
                      <h4 className="font-medium text-sm md:text-base text-muted-foreground">
                        Item {index + 1} - {TSHIRT_COLORS[item.tshirt_color] || item.tshirt_color} ({item.size}) x{item.quantity}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Mockup Preview */}
                        {item.mockup_url && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Mockup Preview</p>
                            <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                              <img
                                src={item.mockup_url}
                                alt="Mockup preview"
                                className="size-full object-contain"
                              />
                            </div>
                            <a
                              href={item.mockup_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              Open full size
                            </a>
                          </div>
                        )}

                        {/* Original Front Design (for sablon) */}
                        {item.original_front_image_url && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">
                              Original Front Design (Sablon)
                            </p>
                            <div className="aspect-square rounded-lg overflow-hidden border bg-white">
                              <img
                                src={item.original_front_image_url}
                                alt="Original front design"
                                className="size-full object-contain"
                              />
                            </div>
                            <a
                              href={item.original_front_image_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              Download original
                            </a>
                          </div>
                        )}

                        {/* Original Back Design (for sablon) */}
                        {item.original_back_image_url && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">
                              Original Back Design (Sablon)
                            </p>
                            <div className="aspect-square rounded-lg overflow-hidden border bg-white">
                              <img
                                src={item.original_back_image_url}
                                alt="Original back design"
                                className="size-full object-contain"
                              />
                            </div>
                            <a
                              href={item.original_back_image_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              Download original
                            </a>
                          </div>
                        )}

                        {/* No images fallback */}
                        {!item.mockup_url && !item.original_front_image_url && !item.original_back_image_url && (
                          <div className="col-span-full text-center py-8 text-muted-foreground">
                            No design images available for this item
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-5" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">{order.recipient_name}</p>
                <p className="text-sm text-muted-foreground">{order.recipient_phone}</p>
              </div>
              <Separator />
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{order.shipping_address}</p>
                <p>{order.shipping_city}, {order.shipping_province} {order.shipping_postal_code}</p>
                <p>{order.shipping_country}</p>
              </div>
              {order.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium">Order Notes</p>
                    <p className="text-sm text-muted-foreground">{order.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          {user && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="size-5" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-sm">{user.full_name || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">{user.email || order.recipient_name}</p>
                </div>
                {user.phone && (
                  <p className="text-sm text-muted-foreground">Phone: {user.phone}</p>
                )}
                {user.address && (
                  <div className="text-sm text-muted-foreground">
                    <p>{user.address}</p>
                    <p>{user.city}, {user.province} {user.postal_code}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatPrice(order.shipping_cost)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          {payment && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="size-5" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={getStatusBadge(payment.payment_status || "pending")}>
                    {payment.payment_status}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Method</span>
                  <span className="capitalize">{payment.payment_type || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">{formatPrice(payment.gross_amount)}</span>
                </div>
                {payment.paid_at && (
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-sm">
                    <span className="text-muted-foreground">Paid At</span>
                    <span className="sm:text-right">
                      {new Date(payment.paid_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
                {payment.midtrans_transaction_id && (
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-sm">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <span className="font-mono text-xs">{payment.midtrans_transaction_id}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Order Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="size-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground">Created</span>
                  <span className="sm:text-right">
                    {new Date(order.created_at!).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="sm:text-right">
                    {new Date(order.updated_at!).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
