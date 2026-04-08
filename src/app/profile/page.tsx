import { requireAuth, getUserProfile, updateUserProfile } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { userProfileSchema, type UserProfileInput } from "@/lib/validations"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { toast } from "sonner"
import Link from "next/link"
import { User, Package, ArrowRight, Save } from "lucide-react"

export default async function ProfilePage() {
  const session = await requireAuth()
  const profile = await getUserProfile() as any

  async function updateProfile(formData: FormData) {
    "use server"

    const data = {
      full_name: formData.get("full_name") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      province: formData.get("province") as string,
      postal_code: formData.get("postal_code") as string,
    }

    userProfileSchema.parse(data)
    await updateUserProfile(data)
    revalidatePath("/profile")
  }

  const initial = ((profile as any).full_name || session.email).charAt(0).toUpperCase()

  // Fetch orders for history tab
  const supabase = await createClient() as any
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", session.id)
    .order("created_at", { ascending: false })
    .limit(10)

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
        <h1 className="text-3xl md:text-4xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your account details and view your orders
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="size-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <Package className="size-4" />
            Orders
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="md:col-span-1">
              <CardContent className="pt-6 text-center space-y-4">
                <Avatar className="size-24 mx-auto">
                  <AvatarImage src={session.avatar_url || ""} />
                  <AvatarFallback className="text-2xl">{initial}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{profile.full_name || session.email}</h2>
                  <p className="text-sm text-muted-foreground">{session.email}</p>
                </div>
                <Badge>{session.role === "admin" ? "Admin" : "User"}</Badge>
                
                <div className="text-sm text-muted-foreground space-y-1 pt-4">
                  <p>Phone: {profile.phone || "Not set"}</p>
                  <p>City: {profile.city || "Not set"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Edit Profile Form */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your profile and shipping details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={updateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        defaultValue={profile.full_name || ""}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        defaultValue={profile.phone || ""}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      name="address"
                      defaultValue={profile.address || ""}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        defaultValue={profile.city || ""}
                      />
                    </div>

                    <div>
                      <Label htmlFor="province">Province</Label>
                      <Input
                        id="province"
                        name="province"
                        defaultValue={profile.province || ""}
                      />
                    </div>

                    <div>
                      <Label htmlFor="postal_code">Postal Code</Label>
                      <Input
                        id="postal_code"
                        name="postal_code"
                        defaultValue={profile.postal_code || ""}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="gap-2">
                    <Save className="size-4" />
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          {orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order: any) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{order.order_number}</h3>
                          <Badge variant={getStatusBadge(order.status || "pending")}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at!).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-lg font-bold">{formatPrice(order.total)}</p>
                        </div>
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="outline" size="sm" className="gap-2">
                            Details
                            <ArrowRight className="size-3" />
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
                <Package className="size-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start designing your custom t-shirt today
                </p>
                <Link href="/customize">
                  <Button className="gap-2">
                    Start Customizing
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
