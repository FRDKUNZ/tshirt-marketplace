import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Palette,
  Truck,
  Shield,
  Star,
  Check,
  ArrowRight,
  Sparkles,
  Upload,
  ShoppingBag,
} from "lucide-react"
import Image from "next/image"

const features = [
  {
    icon: Palette,
    title: "Full Customization",
    description: "Upload your designs, choose colors, and position them perfectly on front and back.",
  },
  {
    icon: Upload,
    title: "Easy Upload",
    description: "Support for PNG and JPG files. Drag, resize, and rotate your images with ease.",
  },
  {
    icon: ShoppingBag,
    title: "Simple Ordering",
    description: "Add to cart, checkout, and pay securely with multiple payment options.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Printed and shipped within 3-5 business days straight to your doorstep.",
  },
  {
    icon: Shield,
    title: "Quality Guaranteed",
    description: "Premium quality printing with vibrant colors that last wash after wash.",
  },
  {
    icon: Sparkles,
    title: "Real-time Preview",
    description: "See exactly how your t-shirt will look before you place your order.",
  },
]

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Small Business Owner",
    content: "TeeCraft made it so easy to create custom merch for my team. The design tool is intuitive and the quality is outstanding!",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Event Organizer",
    content: "Ordered 100 custom tees for our festival. The process was smooth, delivery was on time, and everyone loved their shirts.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Freelance Designer",
    content: "As a designer, I appreciate the canvas tool. It lets me position my artwork exactly how I want it. Highly recommend!",
    rating: 5,
  },
]

const pricing = [
  {
    name: "Single Tee",
    price: 149000,
    description: "Perfect for personal use or gifts",
    features: [
      "Full front & back customization",
      "Premium cotton material",
      "High-quality DTG printing",
      "Free design template",
    ],
  },
  {
    name: "Bundle (5+)",
    price: 129000,
    description: "Great for teams and small groups",
    features: [
      "Everything in Single Tee",
      "Bulk discount pricing",
      "Multiple size options",
      "Priority processing",
    ],
    popular: true,
  },
  {
    name: "Bulk (50+)",
    price: 99000,
    description: "Best value for large orders",
    features: [
      "Everything in Bundle",
      "Maximum discount",
      "Dedicated support",
      "Custom packaging options",
    ],
  },
]

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price)
}

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16 py-8 md:py-16">
      {/* Hero Section */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">
          <Badge variant="secondary" className="gap-2">
            <Sparkles className="size-4" />
            Design Your Own T-Shirt
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Create Custom T-Shirts{" "}
            <span className="text-primary">Your Way</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            Upload your designs, choose your colors, and position them perfectly. 
            Get premium quality custom t-shirts delivered to your door.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/customize">
              <Button size="lg" className="gap-2">
                Start Customizing
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="#pricing">
              <Button size="lg" variant="outline">
                View Pricing
              </Button>
            </Link>
          </div>

          {/* Hero Preview */}
          <div className="relative w-full max-w-2xl mt-8">
            <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/20 flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <Shirt className="size-24 text-primary/50" />
                <p className="text-muted-foreground">
                  Interactive t-shirt preview with drag & drop design tool
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Features</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Create
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful design tools combined with premium printing quality
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 space-y-4">
                  <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="size-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">How It Works</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Three Simple Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { step: "1", title: "Design", desc: "Upload your artwork and position it on the t-shirt" },
            { step: "2", title: "Order", desc: "Choose your size, add to cart, and checkout" },
            { step: "3", title: "Receive", desc: "Get your custom tee printed and delivered" },
          ].map((item) => (
            <div key={item.step} className="text-center space-y-4">
              <div className="size-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Pricing</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Quality custom t-shirts at competitive prices
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricing.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular ? "border-primary shadow-lg scale-105" : ""
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                
                <div className="text-4xl font-bold">
                  {formatPrice(plan.price)}
                  <span className="text-base font-normal text-muted-foreground">/tee</span>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="size-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/customize">
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Testimonials</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Loved by Thousands
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="size-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="py-16 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Create Your Custom Tee?
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Start designing today and get your unique t-shirt delivered in just a few days.
            </p>
            <Link href="/customize">
              <Button size="lg" variant="secondary" className="gap-2">
                Start Customizing Now
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function Shirt({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 2 8 2" />
      <path d="m2 7 4.5 3" />
      <path d="m22 7-4.5 3" />
      <path d="M8.5 5.5 6 10l-4 2v10h20V12l-4-2-2.5-4.5" />
    </svg>
  )
}
