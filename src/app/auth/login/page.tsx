"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Globe, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const callbackUrl = `${appUrl}/auth/callback`

    const { data, error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    })

    if (signInError) {
      console.error("signInWithOAuth error:", signInError)
      setError(signInError.message)
      setIsLoading(false)
      return
    }

    if (data.url) {
      window.location.href = data.url
    }
  }

  const errorMessages: Record<string, string> = {
    no_code: "No authorization code received. Please try again.",
    exchange_failed: "Failed to complete sign in. Please try again.",
    auth_failed: "Authentication failed. Please try again.",
    access_denied: "Access was denied by the OAuth provider.",
    unauthorized_client: "OAuth client is not authorized. Check Supabase configuration.",
  }

  const displayError = error && errorMessages[error] ? errorMessages[error] : error

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">Welcome to TeeCraft</CardTitle>
          <CardDescription>
            Sign in to start creating custom t-shirts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {displayError && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Sign In Error</AlertTitle>
              <AlertDescription>
                {displayError}
                {error === "unauthorized_client" && (
                  <p className="mt-2 text-sm">
                    Make sure Google OAuth is enabled{" "}
                    <a
                      href="https://supabase.com/dashboard/project/ilaxwyvtuflprryfmftm/auth/providers"
                      target="_blank"
                      className="underline font-medium"
                    >
                      in Supabase Dashboard
                    </a>
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full gap-2"
            size="lg"
          >
            {isLoading ? (
              <>
                <Spinner data-icon="inline-start" />
                Redirecting...
              </>
            ) : (
              <>
                <Globe data-icon="inline-start" />
                Continue with Google
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
