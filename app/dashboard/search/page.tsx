"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface SearchResult {
  id: number
  type: "note" | "folder"
  title: string
  folder?: string
  content?: string
  date: string
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setHasSearched(true)
      // Simulate search results
      setResults([
        {
          id: 1,
          type: "note",
          title: "Patient Follow-up Consultation",
          folder: "General Practice",
          content: "Patient reports improvement in symptoms after treatment...",
          date: "2 hours ago",
        },
        {
          id: 2,
          type: "note",
          title: "Initial Patient Intake - John Smith",
          folder: "Cardiology Patients",
          content: "Chief complaint: persistent headaches, worse in morning...",
          date: "1 day ago",
        },
        {
          id: 3,
          type: "folder",
          title: "Follow-ups",
          content: "Contains 5 notes",
          date: "3 days ago",
        },
      ])
    }
  }

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
            <h1 className="text-3xl font-bold text-foreground">Search</h1>
            <p className="text-muted-foreground mt-1">Find notes and folders across your workspace</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search notes, patients, folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 bg-input border-border text-foreground"
              autoFocus
            />
          </div>
          <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Search
          </Button>
        </div>

        {/* Search Results */}
        {hasSearched ? (
          <div className="space-y-3">
            {results.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground">Found {results.length} results</p>
                {results.map((result) => (
                  <Link
                    key={result.id}
                    href={
                      result.type === "note"
                        ? `/dashboard/editor?noteId=${result.id}`
                        : `/dashboard/folder/${result.id}`
                    }
                  >
                    <Card className="bg-card border border-border hover:border-primary hover:shadow-md transition-all cursor-pointer p-4 group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${result.type === "note" ? "bg-blue-500/10 text-blue-700" : "bg-purple-500/10 text-purple-700"}`}
                            >
                              {result.type === "note" ? "Note" : "Folder"}
                            </span>
                            {result.folder && <span className="text-xs text-muted-foreground">{result.folder}</span>}
                          </div>
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mt-2">
                            {result.title}
                          </h3>
                          {result.content && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{result.content}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">{result.date}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </>
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Start typing to search your notes and folders</p>
          </div>
        )}
      </div>
    </div>
  )
}
