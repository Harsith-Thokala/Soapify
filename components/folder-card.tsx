"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Trash2, FileText, FilePlus2 } from "lucide-react"

interface FolderType {
  id: string
  name: string
  notes: number
  lastUpdated: string
  color?: string
  description?: string
}

export function FolderCard({
  folder,
  onDelete,
  onCreateNote,
  viewMode = "grid",
}: {
  folder: FolderType
  onDelete: (id: string) => void
  onCreateNote?: (id: string) => void
  viewMode?: "grid" | "list"
}) {

  if (viewMode === "list") {
    return (
      <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary hover:shadow-md transition-all">
        <Link href={`/dashboard/folder/${folder.id}`} className="flex-1">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground hover:text-primary transition-colors">{folder.name}</h3>
              <p className="text-sm text-muted-foreground">
                {folder.notes} note{folder.notes !== 1 ? "s" : ""} • Updated {folder.lastUpdated}
              </p>
            </div>
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
            <Button size="icon" variant="ghost">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border border-border">
            {onCreateNote && (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  onCreateNote(folder.id)
                }}
              >
                <FilePlus2 className="w-4 h-4 mr-2" />
                New Note
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-destructive hover:bg-destructive/10 cursor-pointer"
              onClick={(e) => {
                e.preventDefault()
                onDelete(folder.id)
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <Link href={`/dashboard/folder/${folder.id}`}>
      <Card className="bg-card border border-border hover:border-primary hover:shadow-md transition-all cursor-pointer p-4 group">
        <div className="flex items-start justify-between mb-3">
          <svg
            className="w-8 h-8 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"></path>
            <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"></path>
          </svg>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
              <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border border-border">
            {onCreateNote && (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  onCreateNote(folder.id)
                }}
              >
                <FilePlus2 className="w-4 h-4 mr-2" />
                New Note
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-destructive hover:bg-destructive/10 cursor-pointer"
              onClick={(e) => {
                e.preventDefault()
                onDelete(folder.id)
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{folder.name}</h3>
        {folder.description && <p className="text-xs text-muted-foreground mb-2">{folder.description}</p>}
        <p className="text-sm text-muted-foreground">
          {folder.notes} note{folder.notes !== 1 ? "s" : ""} • Updated {folder.lastUpdated}
        </p>
      </Card>
    </Link>
  )
}
