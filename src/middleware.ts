import { createClient as createMiddlewareClient } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = [
  '/profile',
  '/orders',
  '/checkout',
  '/customize',
]

// Routes that require admin role
const adminRoutes = ['/admin']

// Auth routes (redirect to home if already logged in)
const authRoutes = ['/auth/login', '/auth/callback']

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = await createMiddlewareClient(request)

  const pathname = request.nextUrl.pathname
  const requestCookies = request.cookies.getAll()

  console.log(`=== MIDDLEWARE: ${request.method} ${pathname} ===`)
  console.log("Request cookies:", requestCookies.map(c => ({
    name: c.name,
    hasValue: !!c.value,
    valuePreview: c.value ? c.value.substring(0, 30) + "..." : "empty"
  })))

  // Always allow auth callback to process (even if user might already have a session)
  if (pathname.startsWith('/auth/callback')) {
    console.log("Middleware: Allowing callback to process")
    return supabaseResponse
  }

  // Check if user is authenticated
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  console.log("getUser result:", {
    hasUser: !!user,
    userId: user?.id,
    error: userError?.message,
  })

  // Redirect to home if already logged in and trying to access auth routes
  if (user && authRoutes.some((route) => pathname.startsWith(route))) {
    console.log("User already logged in, redirecting to home from auth route")
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Check if accessing protected route without auth
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!user) {
      console.log("Protected route without auth, redirecting to login")
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Check if accessing admin route without admin role
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Check user role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  console.log("Middleware: Allowing request to continue")
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/webhook (webhook routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/webhook|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
