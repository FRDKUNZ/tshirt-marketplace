import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")
  const next = searchParams.get("next")

  console.log("=== AUTH CALLBACK STARTED ===")
  console.log("Request URL:", request.url)
  console.log("Code present:", !!code)
  console.log("Error param:", error)
  console.log("Error description:", errorDescription)
  console.log("Next param:", next)
  console.log("Request cookies:", request.cookies.getAll().map(c => c.name))

  // Check for OAuth error from Google
  if (error) {
    console.error("OAuth error from provider:", { error, errorDescription })
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (!code) {
    console.error("No authorization code in callback URL")
    return NextResponse.redirect(
      new URL("/auth/login?error=no_code", request.url)
    )
  }

  let response = NextResponse.redirect(
    new URL(next || "/profile", request.url)
  )

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            console.log("Setting cookies:", cookiesToSet.map(c => ({ name: c.name, options: c.options })))
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    console.log("Calling exchangeCodeForSession with code...")
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error("exchangeCodeForSession ERROR:", {
        message: exchangeError.message,
        status: exchangeError.status,
        name: exchangeError.name,
      })
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(exchangeError.message)}`, request.url)
      )
    }

    console.log("=== SESSION ESTABLISHED SUCCESSFULLY ===")
    console.log("User ID:", data?.session?.user?.id)
    console.log("User email:", data?.session?.user?.email)
    console.log("Session expires at:", data?.session?.expires_at)

    const cookiesSet = response.cookies.getAll()
    console.log("Cookies set on response:", cookiesSet.map(c => ({
      name: c.name,
      value: c.value.substring(0, 20) + "...",
    })))

    return response
  } catch (err: any) {
    console.error("Auth callback EXCEPTION:", err)
    console.error("Stack:", err?.stack)
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(err?.message || "unknown")}`, request.url)
    )
  }
}
