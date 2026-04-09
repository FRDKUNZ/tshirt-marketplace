"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shirt, ShoppingCart, User, Menu, X, Home, Palette, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useCart } from "@/lib/store/cart"
import { useState, useEffect } from "react"
import { ThemeToggle } from "./theme-toggle"
import { LanguageSwitcher } from "./language-switcher"
import { useLocale } from "@/lib/i18n/locale"
import { t } from "@/lib/i18n/translations"

const navLinks = [
  { href: "/", labelKey: "nav.home" as const, icon: Home },
  { href: "/customize", labelKey: "nav.customize" as const, icon: Palette },
  { href: "/pricing", labelKey: "nav.pricing" as const, icon: Tag },
]

export function Navbar() {
  const pathname = usePathname()
  const itemCount = useCart((state) => state.getItemCount())
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { locale } = useLocale()

  // Prevent hydration mismatch: only show cart badge after client mount
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Shirt className="size-6 text-primary" />
            <span className="text-xl font-bold">Azure Store</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {t(link.labelKey, locale)}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="size-5" />
                {mounted && itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 text-xs">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <User className="size-5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Shirt className="size-5 text-primary" />
                  Azure Store
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                {navLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pathname === link.href
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      }`}
                    >
                      <Icon className="size-4" />
                      {t(link.labelKey, locale)}
                    </Link>
                  )
                })}

                {/* Theme & Language Toggles */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  <LanguageSwitcher />
                  <ThemeToggle />
                </div>

                <div className="flex items-center gap-2 mt-2 pt-4 border-t">
                  <Link href="/cart" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <ShoppingCart className="size-4" />
                      {t("nav.cart", locale)} ({mounted ? itemCount : 0})
                    </Button>
                  </Link>
                  <Link href="/profile" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="icon">
                      <User className="size-4" />
                    </Button>
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
