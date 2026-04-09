"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check, ArrowLeft, Sparkles, Zap, Users, Crown } from "lucide-react"
import { useLocale } from "@/lib/i18n/locale"
import { t } from "@/lib/i18n/translations"

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price)
}

export default function PricingPage() {
  const { locale } = useLocale()

  const pricingPlans = [
    {
      id: "satuan",
      name: "SATUAN",
      tagline: t("plan.satuan.tagline", locale),
      price: 89000,
      priceUpgrade: 128000,
      minOrder: 1,
      icon: Zap,
      popular: false,
      features: [
        t("plan.satuan.f1", locale),
        t("plan.satuan.f2", locale),
        t("plan.satuan.f3", locale),
        t("plan.satuan.f4", locale),
        t("plan.satuan.f5", locale),
        t("plan.satuan.f6", locale),
        t("plan.satuan.f7", locale),
      ],
      cta: t("home.pricing.btn", locale),
      href: "/customize",
    },
    {
      id: "bundle",
      name: "BER-5",
      tagline: t("plan.bundle.tagline", locale),
      price: 79000,
      priceUpgrade: 108000,
      minOrder: 5,
      icon: Users,
      popular: true,
      features: [
        t("plan.bundle.f1", locale),
        t("plan.bundle.f2", locale),
        t("plan.bundle.f3", locale),
        t("plan.bundle.f4", locale),
        t("plan.bundle.f5", locale),
        t("plan.bundle.f6", locale),
        t("plan.bundle.f7", locale),
        t("plan.bundle.f8", locale),
      ],
      cta: t("plan.bundle.cta", locale),
      href: "/customize",
    },
    {
      id: "komunitas",
      name: "KOMUNITAS",
      tagline: t("plan.komunitas.tagline", locale),
      price: 65000,
      priceUpgrade: 84000,
      minOrder: 50,
      icon: Crown,
      popular: false,
      features: [
        t("plan.komunitas.f1", locale),
        t("plan.komunitas.f2", locale),
        t("plan.komunitas.f3", locale),
        t("plan.komunitas.f4", locale),
        t("plan.komunitas.f5", locale),
        t("plan.komunitas.f6", locale),
        t("plan.komunitas.f7", locale),
        t("plan.komunitas.f8", locale),
        t("plan.komunitas.f9", locale),
        t("plan.komunitas.f10", locale),
      ],
      cta: t("plan.komunitas.cta", locale),
      href: "/customize",
    },
  ]

  const addOns = [
    { name: t("addon.1", locale), price: "Rp 19.000 – Rp 39.000" },
    { name: t("addon.2", locale), price: "+Rp 5.000" },
    { name: t("addon.3", locale), price: "+Rp 15.000" },
    { name: t("addon.4", locale), price: "+Rp 20.000" },
    { name: t("addon.5", locale), price: "+Rp 10.000" },
    { name: t("addon.6", locale), price: "+Rp 8.000" },
    { name: t("addon.7", locale), price: "+Rp 25.000" },
    { name: t("addon.8", locale), price: "Rp 30.000 – Rp 75.000" },
  ]

  return (
    <div className="flex flex-col gap-8 md:gap-16 py-6 md:py-16">
      {/* Header */}
      <section className="container mx-auto px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 md:mb-8 transition-colors text-sm">
          <ArrowLeft className="size-4" />
          {t("pricing.back", locale)}
        </Link>

        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="secondary" className="gap-2 mb-4">
            <Sparkles className="size-4" />
            {t("pricing.badge", locale)}
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            {t("pricing.title", locale)}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            {t("pricing.desc", locale)}
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => {
            const Icon = plan.icon
            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col ${plan.popular
                  ? "border-primary shadow-xl md:scale-105 z-10"
                  : "shadow-md"
                  }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-0 left-1/2 -translate-x-1/2 z-20">
                    {t("home.pricing.popular", locale)}
                  </Badge>
                )}

                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 md:gap-3 mb-2">
                    <div className="size-8 md:size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="size-4 md:size-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl">{plan.name}</CardTitle>
                  </div>
                  <CardDescription className="text-xs md:text-sm">{plan.tagline}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-4 md:space-y-6">
                  {/* Price */}
                  <div>
                    <div className="text-3xl md:text-4xl font-bold">
                      {formatPrice(plan.price)}
                      <span className="text-sm md:text-base font-normal text-muted-foreground"> {t("home.pricing.per", locale)}</span>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      {t("pricing.min.order", locale)} {plan.minOrder} {t("pricing.side1", locale)}
                    </p>
                  </div>

                  <Separator />

                  {/* Features */}
                  <ul className="space-y-2 md:space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="size-3.5 md:size-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-xs md:text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Separator />

                  {/* Upgrade price */}
                  <div className="text-xs md:text-sm text-muted-foreground">
                    {t("pricing.upgrade.sides", locale)}{" "}
                    <span className="font-semibold text-foreground">
                      {formatPrice(plan.priceUpgrade)}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <Link href={plan.href} className="w-full">
                    <Button
                      className="w-full text-sm"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Add-Ons */}
      <section className="container mx-auto px-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl md:text-2xl">{t("pricing.addon.title", locale)}</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {t("pricing.addon.desc", locale)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
              {addOns.map((addon) => (
                <div
                  key={addon.name}
                  className="flex items-center justify-between gap-2 md:gap-4 rounded-lg border p-2 md:p-3"
                >
                  <span className="text-xs md:text-sm">{addon.name}</span>
                  <span className="text-xs md:text-sm font-semibold whitespace-nowrap">{addon.price}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Savings Breakdown */}
      <section className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl md:text-2xl">{t("pricing.summary.title", locale)}</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {t("pricing.summary.desc", locale)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full text-xs md:text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold">{t("pricing.table.pkg", locale)}</th>
                    <th className="text-center py-2 md:py-3 px-2 md:px-4 font-semibold">{t("pricing.table.min", locale)}</th>
                    <th className="text-center py-2 md:py-3 px-2 md:px-4 font-semibold">{t("pricing.table.side1", locale)}</th>
                    <th className="text-center py-2 md:py-3 px-2 md:px-4 font-semibold">{t("pricing.table.side2", locale)}</th>
                    <th className="text-center py-2 md:py-3 px-2 md:px-4 font-semibold">{t("pricing.table.total", locale)}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 md:py-3 px-2 md:px-4 font-medium">SATUAN</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center">1 pcs</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center">{formatPrice(89000)}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center">{formatPrice(128000)}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center">{formatPrice(89000)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 md:py-3 px-2 md:px-4 font-medium">BER-5</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center">5 pcs</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center">{formatPrice(79000)}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center">{formatPrice(108000)}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center">{formatPrice(395000)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 md:py-3 px-2 md:px-4 font-medium">KOMUNITAS</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center">50 pcs</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center">{formatPrice(65000)}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center">{formatPrice(84000)}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center">{formatPrice(3250000)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4">
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="py-8 md:py-12 text-center space-y-4 md:space-y-6">
            <h2 className="text-2xl md:text-3xl md:text-4xl font-bold">
              {t("pricing.cta.title", locale)}
            </h2>
            <p className="text-base md:text-lg opacity-90 max-w-2xl mx-auto">
              {t("pricing.cta.desc", locale)}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Link href="/customize">
                <Button size="lg" variant="secondary" className="gap-2 text-sm">
                  {t("pricing.cta.start", locale)}
                  <Sparkles className="size-4" />
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="secondary" className="gap-2 text-sm">
                  {t("pricing.cta.contact", locale)}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
