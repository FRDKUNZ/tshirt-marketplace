import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const next = searchParams.get("next")

  console.log("=== AUTH CALLBACK STARTED ===")
  console.log("Code present:", !!code)
  console.log("Error param:", error)
  console.log("Next param:", next)
  console.log("Full URL:", request.url)

  // Check for OAuth error from Google
  if (error) {
    console.error("OAuth error:", error, searchParams.get("error_description"))
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (!code) {
    console.error("No code in callback URL")
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
            console.log("Setting cookies:", cookiesToSet.map(c => c.name))
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error("exchangeCodeForSession ERROR:", exchangeError)
      console.error("Error message:", exchangeError.message)
      console.error("Error status:", exchangeError.status)
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(exchangeError.message)}`, request.url)
      )
    }

    console.log("Session established!")
    console.log("User ID:", data?.session?.user?.id)
    console.log("User email:", data?.session?.user?.email)
    console.log("Cookies set on response:", response.cookies.getAll().map(c => c.name))

    return response
  } catch (err: any) {
    console.error("Auth callback EXCEPTION:", err)
    console.error("Stack:", err?.stack)
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(err?.message || "unknown")}`, request.url)
    )
  }
}
