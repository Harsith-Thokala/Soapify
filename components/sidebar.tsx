"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Settings, Heart, Plus, MessageCircle } from "lucide-react"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: MessageCircle, label: "Assistant", href: "/dashboard/chatbot" },
]

const settingsItems = [{ icon: Settings, label: "Settings", href: "/dashboard/settings" }]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col h-screen overflow-hidden">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Heart className="w-6 h-6 text-sidebar-primary" fill="currentColor" />
          <span className="text-lg font-semibold">SOAPify</span>
        </Link>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Main Navigation */}
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-sm ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Button>
            </Link>
          )
        })}

        <Link href="/dashboard/editor">
          <Button className="w-full mt-4 bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground justify-start">
            <Plus className="w-4 h-4 mr-3 flex-shrink-0" />
            New Note
          </Button>
        </Link>

        <div className="pt-4 border-t border-sidebar-border mt-4 space-y-1">
          {settingsItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-sm ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </div>
      </nav>

    </aside>
  )
}
