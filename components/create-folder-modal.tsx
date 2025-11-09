"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface CreateFolderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (name: string, description?: string) => void
}

export function CreateFolderModal({ open, onOpenChange, onCreate }: CreateFolderModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name, description.trim() || undefined)
      setName("")
      setDescription("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create New Folder</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Give your folder a name and optional description
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Folder name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && name.trim() && handleCreate()}
            className="bg-input border-border text-foreground"
            autoFocus
          />
          <Textarea
            placeholder="Optional description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-input border-border text-foreground resize-none"
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
