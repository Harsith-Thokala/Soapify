"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Heart } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useProfileStore } from "@/stores/profile-store"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setProfile } = useProfileStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setIsLoading(false)
      return
    }

    if (data?.user) {
      const metadata = data.user.user_metadata || {}
      setProfile({
        id: data.user.id,
        firstName: metadata.first_name ?? "",
        lastName: metadata.last_name ?? "",
        title: metadata.title ?? "Dr.",
        specialization: metadata.specialization ?? "",
        license: metadata.license ?? "",
        email: data.user.email ?? email,
      })
    }

    router.push("/dashboard")
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2">
        <Heart className="w-7 h-7 text-primary" fill="currentColor" />
        <span className="text-2xl font-semibold text-foreground">SOAPify</span>
      </div>

      {/* Login Card */}
      <Card className="border border-border bg-card">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-foreground">Welcome Back</CardTitle>
          <CardDescription className="text-muted-foreground">Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            {error && <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">{error}</p>}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                name="soapify-email"
                autoComplete="off"
                placeholder="doctor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                id="password"
                type="password"
                name="soapify-password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input border-border text-foreground"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground space-y-2">
            <div>
              <Link href="#" className="text-primary hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <div>
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
