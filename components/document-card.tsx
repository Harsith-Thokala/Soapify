"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileText, MoreVertical, Trash2, FolderPlus, Undo2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface DocumentCardProps {
  document: {
    id: string
    title: string
    subtitle?: string
    lastUpdated: string
  }
  onView: (id: string) => void
  onDelete: (id: string) => void
  onMove?: (id: string) => void
  onRemoveFromFolder?: (id: string) => void
  className?: string
}

export function DocumentCard({
  document,
  onView,
  onDelete,
  onMove,
  onRemoveFromFolder,
  className,
}: DocumentCardProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onView(document.id)
    }
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onView(document.id)}
      onKeyDown={handleKeyDown}
      className={cn(
        "bg-card border border-border hover:border-primary/60 hover:shadow-md transition-all cursor-pointer",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">{document.title}</h3>
            {document.subtitle && <p className="text-sm text-muted-foreground truncate">{document.subtitle}</p>}
            <p className="text-xs text-muted-foreground mt-2">Updated {document.lastUpdated}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="flex-shrink-0 text-muted-foreground hover:text-foreground"
              onClick={(event) => event.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-card border border-border"
            onClick={(event) => event.stopPropagation()}
          >
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault()
                onView(document.id)
              }}
            >
              View document
            </DropdownMenuItem>
            {onMove && (
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault()
                  onMove(document.id)
                }}
              >
                <FolderPlus className="w-4 h-4 mr-2" />Move to folder
              </DropdownMenuItem>
            )}
            {onRemoveFromFolder && (
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault()
                  onRemoveFromFolder(document.id)
                }}
              >
                <Undo2 className="w-4 h-4 mr-2" />Move to workspace
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(event) => {
                event.preventDefault()
                onDelete(document.id)
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />Delete document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  )
}
