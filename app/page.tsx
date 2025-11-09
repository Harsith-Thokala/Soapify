"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" fill="currentColor" />
            <span className="text-xl font-semibold text-foreground">SOAPify</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button size="sm" variant="ghost" className="text-foreground hover:bg-muted">
                Log In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6 text-balance">
            Professional SOAP Note Management
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
            Organize, streamline, and manage your clinical documentation with our intuitive platform designed
            specifically for healthcare professionals. Completely free and open to everyone.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {[
            {
              title: "Organized Folders",
              description: "Keep your SOAP notes organized in folders for easy access and management",
            },
            {
              title: "AI Assistance",
              description: "Get AI-powered suggestions to complete and improve your clinical notes",
            },
            {
              title: "Professional Design",
              description: "Clean, intuitive interface trusted by healthcare professionals",
            },
          ].map((feature, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
