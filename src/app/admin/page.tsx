import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Package, DollarSign, TrendingUp, Eye, Image as ImageIcon, Download, Trash2 } from "lucide-react"
import Link from "next/link"
import { deleteOrder, deleteCustomPrintUpload } from "./actions"
import { DeleteOrderButton } from "./delete-order-button"
import { DeleteCustomPrintButton } from "./delete-custom-print-button"

export default async function AdminDashboard() {
  await requireAdmin()

  const supabase = await createClient() as any

  // Fetch stats
  const { count: totalOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })

  const { data: orders } = await supabase
    .from("orders")
    .select("*, payments(payment_status)")
    .order("created_at", { ascending: false })
    .limit(50)

  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { count: paidOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "paid")

  const { count: cancelledOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "cancelled")

  const { data: totalRevenue } = await supabase
    .from("orders")
    .select("total")
    .eq("status", "paid")

  const revenue = totalRevenue?.reduce((sum: number, order: any) => sum + Number(order.total), 0) || 0

  // Fetch custom print uploads
  const { data: customPrintUploads } = await supabase
    .from("custom_print_uploads")
    .select(`
      *,
      users(full_name, email)
    `)
    .order("created_at", { ascending: false })
    .limit(50)

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
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage orders, view analytics, and track performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl md:text-3xl font-bold">{totalOrders || 0}</p>
              </div>
              <Package className="size-8 md:size-10 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl md:text-3xl font-bold text-yellow-600">{pendingOrders || 0}</p>
              </div>
              <TrendingUp className="size-8 md:size-10 text-yellow-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl md:text-3xl font-bold text-green-600">{paidOrders || 0}</p>
              </div>
              <DollarSign className="size-8 md:size-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Cancelled</p>
                <p className="text-2xl md:text-3xl font-bold text-destructive">{cancelledOrders || 0}</p>
              </div>
              <TrendingUp className="size-8 md:size-10 text-destructive opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Orders and Custom Prints */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders" className="gap-2">
            <Package className="size-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="custom-prints" className="gap-2">
            <ImageIcon className="size-4" />
            Custom Print Uploads
          </TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle>Recent Orders</CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Link href="/admin">
                    <Button variant="default" size="sm" className="h-9 min-h-[36px]">All</Button>
                  </Link>
                  <Link href="/admin?status=pending">
                    <Button variant="outline" size="sm" className="h-9 min-h-[36px]">Pending</Button>
                  </Link>
                  <Link href="/admin?status=paid">
                    <Button variant="outline" size="sm" className="h-9 min-h-[36px]">Paid</Button>
                  </Link>
                  <Link href="/admin?status=cancelled">
                    <Button variant="outline" size="sm" className="h-9 min-h-[36px]">Cancelled</Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[140px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders?.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.order_number}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.recipient_name}</p>
                            <p className="text-sm text-muted-foreground">{order.recipient_phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(order.created_at!).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="font-bold">{formatPrice(order.total)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadge(order.payments?.payment_status || "pending")}>
                            {order.payments?.payment_status || "pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadge(order.status || "pending")}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Link href={`/admin/orders/${order.id}`}>
                              <Button variant="outline" size="sm" className="h-8">
                                <Eye className="size-3" />
                              </Button>
                            </Link>
                            <DeleteOrderButton orderId={order.id} orderNumber={order.order_number} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {orders?.map((order: any) => (
                  <Card key={order.id} className="border-2">
                    <CardContent className="p-4 space-y-3">
                      {/* Header: Order Number + Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{order.order_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at!).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                          <Badge variant={getStatusBadge(order.status || "pending")} className="text-xs">
                            {order.status}
                          </Badge>
                          <Badge variant={getStatusBadge(order.payments?.payment_status || "pending")} className="text-xs">
                            {order.payments?.payment_status || "pending"}
                          </Badge>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{order.recipient_name}</span>
                        <span className="text-muted-foreground text-xs">{order.recipient_phone}</span>
                      </div>

                      {/* Footer: Total + Actions */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <p className="text-lg font-bold">{formatPrice(order.total)}</p>
                        <div className="flex gap-1.5">
                          <DeleteOrderButton orderId={order.id} orderNumber={order.order_number} />
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="outline" size="sm" className="gap-2 h-10 min-h-[44px]">
                              <Eye className="size-4" />
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {(!orders || orders.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  No orders yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Print Uploads Tab */}
        <TabsContent value="custom-prints">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="size-5" />
                    Custom Print Uploads
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage print images uploaded by users
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Preview</TableHead>
                      <TableHead>File</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[140px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customPrintUploads?.map((upload: any) => (
                      <TableRow key={upload.id}>
                        <TableCell>
                          <div className="size-16 rounded overflow-hidden border">
                            <img
                              src={upload.file_url}
                              alt={upload.file_name}
                              className="size-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium truncate max-w-[200px]">{upload.file_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {upload.file_size ? `${(upload.file_size / 1024).toFixed(1)} KB` : 'N/A'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{upload.users?.full_name || 'Anonymous'}</p>
                            <p className="text-xs text-muted-foreground">{upload.users?.email || 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm max-w-[200px] truncate">
                            {upload.description || '-'}
                          </p>
                        </TableCell>
                        <TableCell>
                          {new Date(upload.created_at!).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadge(upload.status || "pending")}>
                            {upload.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <a
                              href={upload.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="outline" size="sm" className="h-8" title="Download">
                                <Download className="size-3" />
                              </Button>
                            </a>
                            <DeleteCustomPrintButton printId={upload.id} fileName={upload.file_name} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {customPrintUploads?.map((upload: any) => (
                  <Card key={upload.id} className="border-2">
                    <CardContent className="p-4 space-y-3">
                      {/* Header: File Name + Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="size-16 rounded overflow-hidden border flex-shrink-0">
                            <img
                              src={upload.file_url}
                              alt={upload.file_name}
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{upload.file_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(upload.created_at!).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusBadge(upload.status || "pending")} className="text-xs flex-shrink-0">
                          {upload.status}
                        </Badge>
                      </div>

                      {/* User Info */}
                      <div className="text-sm">
                        <p className="font-medium">{upload.users?.full_name || 'Anonymous'}</p>
                        <p className="text-xs text-muted-foreground">{upload.users?.email || 'N/A'}</p>
                      </div>

                      {/* Description */}
                      {upload.description && (
                        <p className="text-sm text-muted-foreground">{upload.description}</p>
                      )}

                      {/* Footer: Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        <a
                          href={upload.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button variant="outline" size="sm" className="w-full gap-2 h-10 min-h-[44px]">
                            <Download className="size-4" />
                            Download
                          </Button>
                        </a>
                        <DeleteCustomPrintButton printId={upload.id} fileName={upload.file_name} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {(!customPrintUploads || customPrintUploads.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  No print uploads yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
