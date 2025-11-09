"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useProfileStore } from "@/stores/profile-store"

export function TopNav() {
  const router = useRouter()
  const { firstName, lastName, title, email, resetProfile, setProfile } = useProfileStore()
  const [isMounted, setIsMounted] = useState(false)
  const displayName =
    firstName || lastName ? `${[title || "Dr.", firstName, lastName].filter(Boolean).join(" ")}` : `${title || "Dr."} Guest`
  const displayEmail = email || "Not signed in"

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    const syncProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const metadata = user.user_metadata || {}
        setProfile({
          id: user.id,
          firstName: metadata.first_name ?? "",
          lastName: metadata.last_name ?? "",
          title: metadata.title ?? "Dr.",
          email: user.email ?? "",
          specialization: metadata.specialization ?? "",
          license: metadata.license ?? "",
        })
      } else {
        resetProfile()
      }
    }

    void syncProfile()
  }, [isMounted, resetProfile, setProfile])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    resetProfile()
    router.push("/")
  }

  if (!isMounted) {
    return (
      <header className="border-b border-border bg-card px-4 md:px-8 py-4 flex items-center justify-end gap-3">
        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
      </header>
    )
  }

  return (
    <header className="border-b border-border bg-card px-4 md:px-8 py-4 flex items-center justify-end gap-3">
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="rounded-full bg-primary/10 text-primary hover:bg-primary/20">
              <User className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border border-border w-48 space-y-2">
            <div className="px-3 pt-2">
              <p className="text-sm font-semibold text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground">{displayEmail}</p>
            </div>
            <div className="border-t border-border" />
            <DropdownMenuItem
              className="text-destructive hover:bg-destructive/10 cursor-pointer text-sm"
              onClick={handleLogout}
            >
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
