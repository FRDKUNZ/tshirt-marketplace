import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
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
import { ArrowLeft, Package, MapPin, CreditCard, ShoppingBag } from "lucide-react"
import { CancelOrderButton } from "../cancel-order-button"

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireAuth()
  const { id } = await params
  const supabase = await createClient() as any

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", session.id)
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/orders">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="size-4" />
            Back to Orders
          </Button>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{order.order_number}</h1>
            <p className="text-muted-foreground">
              Placed on {new Date(order.created_at!).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant={getStatusBadge(order.status || "pending")} className="text-sm px-3 py-1">
              {order.status}
            </Badge>
            {payment && (
              <Badge variant={getStatusBadge(payment.payment_status || "pending")} className="text-sm px-3 py-1">
                Payment: {payment.payment_status}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="size-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
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

        {/* Order Summary & Payment */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
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
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Paid At</span>
                    <span>
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

                {payment.payment_status === "pending" && order.status === "pending" && (
                  <Link href={`/payment/${order.id}?token=${payment.midtrans_order_id}`}>
                    <Button className="w-full mt-4">Complete Payment</Button>
                  </Link>
                )}

                {(order.status === "pending" || order.status === "paid") && (
                  <div className="pt-2">
                    <CancelOrderButton orderId={order.id} orderNumber={order.order_number} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="size-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium text-sm">Order Placed</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at!).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                {order.status === "paid" || order.status === "processing" || order.status === "shipped" || order.status === "delivered" ? (
                  <div className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primary mt-2" />
                    <div>
                      <p className="font-medium text-sm">Payment Confirmed</p>
                      {payment?.paid_at && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.paid_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}
                {order.status === "processing" || order.status === "shipped" || order.status === "delivered" ? (
                  <div className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primary mt-2" />
                    <div>
                      <p className="font-medium text-sm">Processing</p>
                      <p className="text-xs text-muted-foreground">Your order is being prepared</p>
                    </div>
                  </div>
                ) : null}
                {order.status === "shipped" || order.status === "delivered" ? (
                  <div className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primary mt-2" />
                    <div>
                      <p className="font-medium text-sm">Shipped</p>
                      <p className="text-xs text-muted-foreground">Your order is on its way</p>
                    </div>
                  </div>
                ) : null}
                {order.status === "delivered" ? (
                  <div className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-green-500 mt-2" />
                    <div>
                      <p className="font-medium text-sm text-green-600">Delivered</p>
                      <p className="text-xs text-muted-foreground">Order completed successfully</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
