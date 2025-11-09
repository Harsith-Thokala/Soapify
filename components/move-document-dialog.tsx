"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Folder, FolderX } from "lucide-react"

interface MoveDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folders: Array<{ id: string; name: string }>
  documentTitle?: string | null
  onMove: (folderId: string | null) => void
}

export function MoveDocumentDialog({ open, onOpenChange, folders, documentTitle, onMove }: MoveDocumentDialogProps) {
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (open) {
      setQuery("")
    }
  }, [open])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return folders
    return folders.filter((folder) => folder.name.toLowerCase().includes(normalized))
  }, [folders, query])

  const handleMove = (folderId: string | null) => {
    onMove(folderId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Move document</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {documentTitle ? `Choose a folder for “${documentTitle}”.` : "Select a destination folder."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search folders..."
            className="bg-input border border-border text-foreground"
          />

          <div className="max-h-60 overflow-auto space-y-2">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No folders match that search.</p>
            ) : (
              filtered.map((folder) => (
                <Button
                  key={folder.id}
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => handleMove(folder.id)}
                >
                  <Folder className="w-4 h-4 mr-2 text-primary" />
                  {folder.name}
                </Button>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button variant="outline" className="bg-transparent" onClick={() => handleMove(null)}>
            <FolderX className="w-4 h-4 mr-2" />Move to workspace
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
