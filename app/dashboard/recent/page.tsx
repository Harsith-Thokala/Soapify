"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface RecentNote {
  id: number
  title: string
  folder: string
  excerpt: string
  updatedAt: string
}

export default function RecentNotesPage() {
  const recentNotes: RecentNote[] = [
    {
      id: 1,
      title: "Patient Follow-up Consultation",
      folder: "General Practice",
      excerpt: "Patient reports improvement in symptoms after treatment...",
      updatedAt: "2 hours ago",
    },
    {
      id: 2,
      title: "Initial Patient Intake - John Smith",
      folder: "Cardiology Patients",
      excerpt: "Chief complaint: persistent headaches, worse in morning...",
      updatedAt: "1 day ago",
    },
    {
      id: 3,
      title: "Annual Physical Examination",
      folder: "General Practice",
      excerpt: "Patient in good health. Continue current medications...",
      updatedAt: "2 days ago",
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
            <h1 className="text-3xl font-bold text-foreground">Recent Notes</h1>
            <p className="text-muted-foreground mt-1">Your recently updated notes</p>
          </div>
        </div>

        {/* Recent Notes List */}
        <div className="space-y-3">
          {recentNotes.map((note) => (
            <Link key={note.id} href={`/dashboard/editor?noteId=${note.id}`}>
              <Card className="bg-card border border-border hover:border-primary hover:shadow-md transition-all cursor-pointer p-4 group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {note.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{note.folder}</p>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{note.excerpt}</p>
                    <p className="text-xs text-muted-foreground mt-2">Updated {note.updatedAt}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
