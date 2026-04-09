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
import { useLocale } from "@/lib/i18n/locale"
import { t } from "@/lib/i18n/translations"

export default function CartPage() {
  const router = useRouter()
  const items = useCart((state) => state.items)
  const removeItem = useCart((state) => state.removeItem)
  const updateQuantity = useCart((state) => state.updateQuantity)
  const getTotal = useCart((state) => state.getTotal)
  const getItemCount = useCart((state) => state.getItemCount)
  const getItemUnitPrice = useCart((state) => state.getItemUnitPrice)
  const clearCart = useCart((state) => state.clearCart)
  const { locale } = useLocale()

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
            title={t("cart.empty.title", locale)}
            description={t("cart.empty.desc", locale)}
          >
            <Link href="/customize">
              <Button className="gap-2">
                {t("cart.empty.cta", locale)}
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </Empty>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">{t("cart.title", locale)}</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {items.length} {t("cart.items.in.cart", locale)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Preview Image */}
                  <div
                    className="w-full sm:w-32 h-40 sm:h-32 rounded-lg border-2 flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: item.design.tshirt_color }}
                  >
                    <ShoppingCart className="size-8 md:size-10 opacity-50" />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 space-y-3 min-w-0">
                    {/* Header with Remove Button */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base md:text-lg truncate">Custom T-Shirt</h3>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <Badge variant="secondary" className="text-xs">
                            {t("cart.size", locale)}: {item.size}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {item.design.tshirt_color}
                          </Badge>
                          {item.design.front_design && (
                            <Badge variant="secondary" className="text-xs">
                              {t("cart.front", locale)}
                            </Badge>
                          )}
                          {item.design.back_design && (
                            <Badge variant="secondary" className="text-xs">
                              {t("cart.back", locale)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="size-11 text-muted-foreground hover:text-destructive flex-shrink-0"
                        aria-label="Remove item"
                      >
                        <Trash2 className="size-5" />
                      </Button>
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-11"
                          onClick={() =>
                            updateQuantity(item.id, Math.max(1, item.quantity - 1))
                          }
                          disabled={item.quantity <= 1}
                          aria-label={t("common.decrease", locale) || "Decrease quantity"}
                        >
                          <Minus className="size-4" />
                        </Button>
                        <span className="w-10 text-center font-medium text-base" aria-label={t("cart.qty", locale)}>
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-11"
                          onClick={() =>
                            updateQuantity(item.id, Math.min(10, item.quantity + 1))
                          }
                          disabled={item.quantity >= 10}
                          aria-label={t("common.increase", locale) || "Increase quantity"}
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>

                      {/* Price Info */}
                      <div className="flex items-center justify-between sm:justify-end sm:text-right gap-2 sm:gap-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {(() => {
                              const sides = item.design.front_design && item.design.back_design ? 2 : 1
                              const { tier } = getUnitPrice(totalQty, sides as 1 | 2)
                              return tier.name
                            })()}
                          </Badge>
                          <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">
                            {formatPrice(getItemUnitPrice(item.id))}/pc
                          </span>
                        </div>
                        <p className="text-base md:text-lg font-bold whitespace-nowrap">
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
            className="gap-2 w-full sm:w-auto"
          >
            <Trash2 className="size-4" />
            {t("cart.clear", locale)}
          </Button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-24">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg md:text-xl">{t("cart.summary", locale)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {totalQty >= 5 && (
                <Badge variant="secondary" className="w-full justify-center py-2 text-sm text-green-700 dark:text-green-400">
                  ✓ Harga {totalQty >= 50 ? "KOMUNITAS" : "BER-5"} {t("cart.price.active", locale)} — {t("cart.price.save", locale)}
                </Badge>
              )}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("cart.subtotal", locale)} ({totalQty} item{totalQty !== 1 ? "s" : ""})</span>
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

              <div className="space-y-3 pt-2">
                <Button
                  onClick={() => router.push("/checkout")}
                  className="w-full gap-2"
                  size="lg"
                >
                  {t("cart.checkout", locale)}
                  <ArrowRight className="size-4" />
                </Button>

                <Link href="/customize">
                  <Button variant="outline" className="w-full">
                    {t("cart.continue", locale)}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
