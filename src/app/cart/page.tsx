"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/store/cart"
import { Trash2, ShoppingCart, ArrowRight, Minus, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Empty } from "@/components/ui/empty"
import { formatRupiah, getUnitPrice } from "@/lib/pricing"

export default function CartPage() {
  const router = useRouter()
  const items = useCart((state) => state.items)
  const removeItem = useCart((state) => state.removeItem)
  const updateQuantity = useCart((state) => state.updateQuantity)
  const getTotal = useCart((state) => state.getTotal)
  const getItemCount = useCart((state) => state.getItemCount)
  const getItemUnitPrice = useCart((state) => state.getItemUnitPrice)
  const clearCart = useCart((state) => state.clearCart)

  const totalQty = getItemCount()
  const total = getTotal()
  const shippingCost = total > 0 ? 15000 : 0
  const grandTotal = total + shippingCost

  const formatPrice = (price: number) => formatRupiah(price)

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center space-y-6">
          <Empty
            icon={<ShoppingCart className="size-16 text-muted-foreground" />}
            title="Your cart is empty"
            description="Start designing your custom t-shirt and add it to cart"
          >
            <Link href="/customize">
              <Button className="gap-2">
                Start Customizing
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </Empty>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground">
          {items.length} item{items.length !== 1 ? "s" : ""} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Preview Placeholder */}
                  <div
                    className="size-32 rounded-lg border-2 flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: item.design.tshirt_color }}
                  >
                    <ShoppingCart className="size-8 opacity-50" />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">Custom T-Shirt</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge variant="secondary">
                            Size: {item.size}
                          </Badge>
                          <Badge variant="secondary">
                            Color: {item.design.tshirt_color}
                          </Badge>
                          {item.design.front_design && (
                            <Badge variant="secondary">
                              Front Design
                            </Badge>
                          )}
                          {item.design.back_design && (
                            <Badge variant="secondary">
                              Back Design
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          onClick={() =>
                            updateQuantity(item.id, Math.max(1, item.quantity - 1))
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          onClick={() =>
                            updateQuantity(item.id, Math.min(10, item.quantity + 1))
                          }
                          disabled={item.quantity >= 10}
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Badge variant="secondary" className="text-xs">
                            {(() => {
                              const sides = item.design.front_design && item.design.back_design ? 2 : 1
                              const { tier } = getUnitPrice(totalQty, sides as 1 | 2)
                              return tier.name
                            })()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatPrice(getItemUnitPrice(item.id))} each
                          </span>
                        </div>
                        <p className="text-lg font-bold">
                          {formatPrice(getItemUnitPrice(item.id) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="outline"
            onClick={clearCart}
            className="gap-2"
          >
            <Trash2 className="size-4" />
            Clear Cart
          </Button>
        </div>

        {/* Order Summary */}
        <Card className="h-fit sticky top-24">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {totalQty >= 5 && (
              <Badge variant="secondary" className="w-full justify-center py-2 text-green-700 dark:text-green-400">
                ✓ Harga {totalQty >= 50 ? "KOMUNITAS" : "BER-5"} aktif — hemat per kaos!
              </Badge>
            )}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
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
              onClick={() => router.push("/checkout")}
              className="w-full gap-2"
              size="lg"
            >
              Proceed to Checkout
              <ArrowRight className="size-4" />
            </Button>

            <Link href="/customize">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
