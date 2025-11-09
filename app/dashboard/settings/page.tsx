"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Lock, Palette, UserCircle } from "lucide-react"
import Link from "next/link"
import { useProfileStore } from "@/stores/profile-store"
import { supabase } from "@/lib/supabaseClient"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  const { id, firstName, lastName, title, specialization, license, email, setProfile: updateProfile } = useProfileStore()
  const { theme: currentTheme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const [profile, setProfileState] = useState({
    id: id ?? null,
    firstName: firstName ?? "",
    lastName: lastName ?? "",
    email: email ?? "",
    title: title || "Dr.",
    specialization: specialization ?? "",
    license: license ?? "",
  })

  useEffect(() => {
    const hydrateProfile = async () => {
      if (firstName || lastName || email) return
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const metadata = user.user_metadata || {}
        updateProfile({
          firstName: metadata.first_name ?? "",
          lastName: metadata.last_name ?? "",
          title: metadata.title ?? "Dr.",
          specialization: metadata.specialization ?? "",
          license: metadata.license ?? "",
          email: user.email ?? "",
        })
      }
    }

    void hydrateProfile()
  }, [firstName, lastName, email, updateProfile])

  useEffect(() => {
    setProfileState({
      id: id ?? null,
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      email: email ?? "",
      title: title || "Dr.",
      specialization: specialization ?? "",
      license: license ?? "",
    })
  }, [id, firstName, lastName, email, title, specialization, license])

  // Display preferences
  const [display, setDisplay] = useState({
    theme: currentTheme ?? "light",
  })

  useEffect(() => {
    if (!isMounted) return
    setDisplay((prev) => ({
      ...prev,
      theme: currentTheme ?? "system",
    }))
  }, [currentTheme, isMounted])

  const handleSaveProfile = async () => {
    setProfileError(null)
    setIsSaving(true)

    const payload = {
      data: {
        first_name: profile.firstName.trim(),
        last_name: profile.lastName.trim(),
        full_name: `${profile.firstName.trim()} ${profile.lastName.trim()}`.trim(),
        title: profile.title.trim() || "Dr.",
        specialization: profile.specialization.trim(),
        license: profile.license.trim(),
      },
    }

    const { data, error } = await supabase.auth.updateUser(payload)

    if (error) {
      setProfileError(error.message)
      setIsSaving(false)
      return
    }

    updateProfile({
      id: data.user?.id ?? profile.id,
      firstName: profile.firstName.trim(),
      lastName: profile.lastName.trim(),
      email: data.user?.email ?? profile.email,
      title: profile.title.trim() || "Dr.",
      specialization: profile.specialization.trim(),
      license: profile.license.trim(),
    })

    setIsSaving(false)
    setShowSaveConfirm(true)
    setTimeout(() => setShowSaveConfirm(false), 2000)
  }

  const settingsSections = [
    {
      id: "profile",
      label: "Profile",
      icon: UserCircle,
    },
    {
      id: "display",
      label: "Display",
      icon: Palette,
    },
  ]

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button size="icon" variant="ghost">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
          </div>
        </div>

        {/* Settings Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Tab Navigation */}
          <div className="md:col-span-1">
            <div className="space-y-2">
              {settingsSections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-left ${
                      activeTab === section.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{section.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="md:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <Card className="bg-card border border-border p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-4">Profile Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">First Name</label>
                      <Input
                        value={profile.firstName}
                        onChange={(e) => setProfileState({ ...profile, firstName: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Last Name</label>
                      <Input
                        value={profile.lastName}
                        onChange={(e) => setProfileState({ ...profile, lastName: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Title</label>
                      <Input
                        value={profile.title}
                        onChange={(e) => setProfileState({ ...profile, title: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Specialization</label>
                      <Input
                        value={profile.specialization}
                        onChange={(e) => setProfileState({ ...profile, specialization: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-foreground">License Number</label>
                      <Input
                        value={profile.license}
                        onChange={(e) => setProfileState({ ...profile, license: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="text-sm font-medium text-foreground mb-4">Email</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email Address</label>
                    <Input
                      value={profile.email}
                      onChange={(e) => setProfileState({ ...profile, email: e.target.value })}
                      type="email"
                      disabled
                      className="bg-muted border-border text-foreground cursor-not-allowed opacity-80"
                    />
                    <p className="text-xs text-muted-foreground">Email changes are managed through Supabase authentication settings.</p>
                  </div>
                </div>

                <div className="border-t border-border pt-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-2">Security</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage your password and account access.
                    </p>
                    <Button variant="outline" className="bg-transparent">
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </div>

                  <div className="border border-destructive/40 rounded-lg p-4 bg-destructive/5">
                    <h3 className="text-sm font-medium text-destructive mb-2">Danger Zone</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Deleting your account will remove all notes and folders permanently.
                    </p>
                    <Button
                      variant="outline"
                      className="text-destructive border-destructive hover:bg-destructive/10 bg-transparent"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border">
                  <Button variant="outline">Cancel</Button>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>

                {showSaveConfirm && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded text-sm text-green-700">
                    Profile updated successfully!
                  </div>
                )}
                {profileError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                    {profileError}
                  </div>
                )}
              </Card>
            )}

            {/* Display Tab */}
            {activeTab === "display" && (
              <Card className="bg-card border border-border p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-4">Display Settings</h2>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Theme</label>
                      <select
                        value={display.theme}
                        onChange={(e) => {
                          const nextTheme = e.target.value
                          setDisplay({ ...display, theme: nextTheme })
                          setTheme(nextTheme)
                        }}
                        className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>
                  </div>
                </div>

            <div className="pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Theme changes apply instantly and persist across sessions.
              </p>
            </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
