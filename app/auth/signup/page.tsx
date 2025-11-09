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

export default function SignupPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please provide your first and last name.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    setIsLoading(true)
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          title: "Dr.",
          specialization: "",
          license: "",
        },
        emailRedirectTo: `${window.location.origin}/auth/login`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setIsLoading(false)
      return
    }

    setSuccessMessage("Check your email to confirm your account. You can return here once verified.")
    setIsLoading(false)
    setTimeout(() => {
      router.push("/auth/login")
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2">
        <Heart className="w-7 h-7 text-primary" fill="currentColor" />
        <span className="text-2xl font-semibold text-foreground">SOAPify</span>
      </div>

      {/* Signup Card */}
      <Card className="border border-border bg-card">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-foreground">Create Account</CardTitle>
          <CardDescription className="text-muted-foreground">Join SOAPify to start managing your notes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4" autoComplete="off">
            {error && <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">{error}</p>}
            {successMessage && (
              <p className="text-sm text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-md p-3">
                {successMessage}
              </p>
            )}
            <div className="space-y-2">
              <label htmlFor="first-name" className="text-sm font-medium text-foreground">
                First Name
              </label>
              <Input
                id="first-name"
                type="text"
                name="soapify-first-name"
                autoComplete="off"
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="last-name" className="text-sm font-medium text-foreground">
                Last Name
              </label>
              <Input
                id="last-name"
                type="text"
                name="soapify-last-name"
                autoComplete="off"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="bg-input border-border text-foreground"
              />
            </div>
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
            <div className="space-y-2">
              <label htmlFor="confirm" className="text-sm font-medium text-foreground">
                Confirm Password
              </label>
              <Input
                id="confirm"
                type="password"
                name="soapify-confirm-password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-input border-border text-foreground"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
