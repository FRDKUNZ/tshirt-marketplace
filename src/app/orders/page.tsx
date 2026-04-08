import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Empty } from "@/components/ui/empty"
import { Package, ArrowRight, Eye } from "lucide-react"

export default async function OrdersPage() {
  const session = await requireAuth()
  const supabase = await createClient() as any

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      payments (
        payment_status
      )
    `)
    .eq("user_id", session.id)
    .order("created_at", { ascending: false })

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">My Orders</h1>
        <p className="text-muted-foreground">
          Track and manage your custom t-shirt orders
        </p>
      </div>

      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-lg">{order.order_number}</h3>
                      <Badge variant={getStatusBadge(order.status || "pending")}>
                        {order.status}
                      </Badge>
                      {order.payments && (
                        <Badge variant={getStatusBadge(order.payments.payment_status || "pending")}>
                          Payment: {order.payments.payment_status}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <p>
                        Date: {new Date(order.created_at!).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p>Items: {order.order_items?.length || 1} product(s)</p>
                      <p>Shipping to: {order.shipping_city}, {order.shipping_province}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-xl font-bold">{formatPrice(order.total)}</p>
                    </div>
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="size-3" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Empty
              icon={<Package className="size-16 text-muted-foreground" />}
              title="No orders yet"
              description="Start designing your custom t-shirt today and see your orders here."
            >
              <Link href="/customize">
                <Button className="gap-2 mt-4">
                  Start Customizing
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </Empty>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
