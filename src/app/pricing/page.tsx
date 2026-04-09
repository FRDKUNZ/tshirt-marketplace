import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check, ArrowLeft, Sparkles, Zap, Users, Crown } from "lucide-react"

const pricingPlans = [
  {
    id: "satuan",
    name: "SATUAN",
    tagline: "Untuk personal, hadiah, atau trial desain",
    price: 89000,
    priceUpgrade: 128000,
    minOrder: 1,
    icon: Zap,
    popular: false,
    features: [
      "Bebas desain custom (full color)",
      "Kaos Combed 30s (lembut & adem)",
      "Pilihan warna kaos: 10+ warna",
      "Ukuran: S – XXL",
      "Pengerjaan 2–3 hari kerja",
      "1x revisi desain gratis",
      "Packaging rapi (plastik + sticker)",
    ],
    cta: "Pesan Sekarang",
    href: "/customize",
  },
  {
    id: "bundle",
    name: "BER-5",
    tagline: "Untuk rombongan kecil, pasangan, tim mini",
    price: 79000,
    priceUpgrade: 108000,
    minOrder: 5,
    icon: Users,
    popular: true,
    features: [
      "Semua fitur Paket Satuan",
      "Hemat Rp 10.000 per kaos",
      "Desain bisa beda tiap kaos",
      "Pilihan sablon: depan / belakang",
      "Pengerjaan 3–4 hari kerja",
      "Gratis 2x revisi desain",
      "Free sticker logo custom",
      "Bisa request nama/nomor di kaos",
    ],
    cta: "Pesan Paket Ber-5",
    href: "/customize",
  },
  {
    id: "komunitas",
    name: "KOMUNITAS",
    tagline: "Untuk event, brand clothing, organisasi",
    price: 65000,
    priceUpgrade: 84000,
    minOrder: 50,
    icon: Crown,
    popular: false,
    features: [
      "Semua fitur Paket Ber-5",
      "Hemat Rp 24.000 per kaos",
      "Desain seragam / custom per pcs",
      "Konsultasi desain GRATIS",
      "Prioritas pengerjaan (express option)",
      "Free sampling 1 pcs sebelum produksi",
      "Free delivery dalam kota",
      "Bisa cicilan / DP 50%",
      "Garansi kaos cacat diganti baru",
      "Invoice & nota resmi",
    ],
    cta: "Hubungi Kami",
    href: "/customize",
  },
]

const addOns = [
  { name: "Tambah sablon sisi ke-2", price: "Rp 19.000 – Rp 39.000" },
  { name: "Upgrade kaos Combed 24s (lebih tebal)", price: "+Rp 5.000" },
  { name: "Sablon glow in the dark", price: "+Rp 15.000" },
  { name: "Sablon foil / metallic", price: "+Rp 20.000" },
  { name: "Bordir nama/logo kecil", price: "+Rp 10.000" },
  { name: "Packaging premium (box + tissue)", price: "+Rp 8.000" },
  { name: "Express 1 hari jadi", price: "+Rp 25.000" },
  { name: "Desain oleh tim kami", price: "Rp 30.000 – Rp 75.000" },
]

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price)
}

export default function PricingPage() {
  return (
    <div className="flex flex-col gap-16 py-8 md:py-16">
      {/* Header */}
      <section className="container mx-auto px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>

        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="secondary" className="gap-2 mb-4">
            <Sparkles className="size-4" />
            Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Harga Custom T-Shirt
          </h1>
          <p className="text-lg text-muted-foreground">
            Harga kompetitif untuk UMKM, mahasiswa, komunitas, dan brand clothing pemula. 
            Semakin banyak, semakin hemat.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => {
            const Icon = plan.icon
            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col ${
                  plan.popular
                    ? "border-primary shadow-xl scale-105 z-10"
                    : "shadow-md"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                    Paling Populer
                  </Badge>
                )}

                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.tagline}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-6">
                  {/* Price */}
                  <div>
                    <div className="text-4xl font-bold">
                      {formatPrice(plan.price)}
                      <span className="text-base font-normal text-muted-foreground"> /kaos</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Min. order {plan.minOrder} pcs — 1 sisi (depan ATAU belakang)
                    </p>
                  </div>

                  <Separator />

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="size-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Separator />

                  {/* Upgrade price */}
                  <div className="text-sm text-muted-foreground">
                    Upgrade 2 sisi (depan + belakang):{" "}
                    <span className="font-semibold text-foreground">
                      {formatPrice(plan.priceUpgrade)}
                    </span>
                  </div>
                </CardContent>

                <CardFooter>
                  <Link href={plan.href} className="w-full">
                    <Button
                      className="w-full"
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
          <CardHeader>
            <CardTitle className="text-2xl">🔥 Add-On / Upgrade</CardTitle>
            <CardDescription>
              Tambahkan fitur premium untuk kaos yang lebih spesial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addOns.map((addon) => (
                <div
                  key={addon.name}
                  className="flex items-center justify-between gap-4 rounded-lg border p-3"
                >
                  <span className="text-sm">{addon.name}</span>
                  <span className="text-sm font-semibold whitespace-nowrap">{addon.price}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Savings Breakdown */}
      <section className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">📊 Ringkasan Harga</CardTitle>
            <CardDescription>
              Perbandingan harga per paket dan total yang harus dibayar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Paket</th>
                    <th className="text-center py-3 px-4 font-semibold">Min. Order</th>
                    <th className="text-center py-3 px-4 font-semibold">Harga/kaos (1 sisi)</th>
                    <th className="text-center py-3 px-4 font-semibold">Harga/kaos (2 sisi)</th>
                    <th className="text-center py-3 px-4 font-semibold">Total Min. Order</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">SATUAN</td>
                    <td className="py-3 px-4 text-center">1 pcs</td>
                    <td className="py-3 px-4 text-center">{formatPrice(89000)}</td>
                    <td className="py-3 px-4 text-center">{formatPrice(128000)}</td>
                    <td className="py-3 px-4 text-center">{formatPrice(89000)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">BER-5</td>
                    <td className="py-3 px-4 text-center">5 pcs</td>
                    <td className="py-3 px-4 text-center">{formatPrice(79000)}</td>
                    <td className="py-3 px-4 text-center">{formatPrice(108000)}</td>
                    <td className="py-3 px-4 text-center">{formatPrice(395000)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">KOMUNITAS</td>
                    <td className="py-3 px-4 text-center">50 pcs</td>
                    <td className="py-3 px-4 text-center">{formatPrice(65000)}</td>
                    <td className="py-3 px-4 text-center">{formatPrice(84000)}</td>
                    <td className="py-3 px-4 text-center">{formatPrice(3250000)}</td>
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
          <CardContent className="py-12 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Siap Memesan Kaos Custom?
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Mulai desain sekarang atau hubungi kami untuk konsultasi gratis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/customize">
                <Button size="lg" variant="secondary" className="gap-2">
                  Mulai Desain
                  <Sparkles className="size-4" />
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline" className="gap-2">
                  Hubungi Kami
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
