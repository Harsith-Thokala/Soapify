"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Plus, Search, ArrowLeft } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { DocumentCard } from "@/components/document-card"
import { MoveDocumentDialog } from "@/components/move-document-dialog"

interface Folder {
  id: string
  name: string
  description?: string | null
  updatedAt: string
  createdAt: string
}

interface Note {
  id: string
  title: string
  updatedAt: string
  createdAt: string
  lastUpdated: string
}

const formatTimeAgo = (input?: string | null) => {
  if (!input) return "Just now"
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return "Just now"

  const diff = Date.now() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return "Just now"
  if (diff < hour) {
    const minutes = Math.floor(diff / minute)
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`
  }
  if (diff < day) {
    const hours = Math.floor(diff / hour)
    return `${hours} hour${hours === 1 ? "" : "s"} ago`
  }
  const days = Math.floor(diff / day)
  return `${days} day${days === 1 ? "" : "s"} ago`
}

export default function FolderPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const folderId = params?.id ?? ""

  const [folder, setFolder] = useState<Folder | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([])
  const [movingDocument, setMovingDocument] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadFolder = useCallback(async () => {
    if (!folderId) return
    setLoading(true)
    setError(null)

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      setError(sessionError.message)
      setLoading(false)
      return
    }

    const user = session?.user

    if (!user) {
      router.push("/auth/login")
      setLoading(false)
      return
    }

    const [folderResponse, docsResponse, foldersResponse] = await Promise.all([
      supabase
        .from("folders")
        .select("id, name, description, created_at, updated_at")
        .eq("id", folderId)
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("documents")
        .select("id, title, created_at, updated_at")
        .eq("user_id", user.id)
        .eq("folder_id", folderId)
        .order("updated_at", { ascending: false }),
      supabase
        .from("folders")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name", { ascending: true }),
    ])

    const { data: folderData, error: folderError } = folderResponse

    if (folderError || !folderData) {
      setError(folderError?.message ?? "Folder not found.")
      setLoading(false)
      return
    }

    const { data: docsData, error: docsError } = docsResponse

    if (docsError) {
      setError(docsError.message)
      setLoading(false)
      return
    }

    const { data: allFoldersData, error: allFoldersError } = foldersResponse

    if (allFoldersError) {
      setError(allFoldersError.message)
      setLoading(false)
      return
    }

    const formattedNotes =
      docsData?.map((doc) => ({
        id: doc.id,
        title: doc.title ?? "Untitled Note",
        createdAt: doc.created_at ?? new Date().toISOString(),
        updatedAt: doc.updated_at ?? doc.created_at ?? new Date().toISOString(),
        lastUpdated: formatTimeAgo(doc.updated_at ?? doc.created_at),
      })) ?? []

    setFolder({
      id: folderData.id,
      name: folderData.name,
      description: folderData.description,
      createdAt: folderData.created_at,
      updatedAt: folderData.updated_at ?? folderData.created_at,
    })

    setNotes(formattedNotes)
    setFolders(allFoldersData ?? [])
    setLoading(false)
  }, [folderId, router])

  useEffect(() => {
    void loadFolder()
  }, [loadFolder])

  const handleCreateNote = () => {
    if (!folderId) return
    router.push(`/dashboard/editor?folder=${folderId}`)
  }

  const handleViewDocument = (id: string) => {
    router.push(`/dashboard/editor?doc=${id}`)
  }

  const handleDeleteDocument = async (id: string) => {
    setError(null)
    const { error: deleteError } = await supabase.from("documents").delete().eq("id", id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    await loadFolder()
  }

  const handleMoveDocument = async (id: string, destination: string | null) => {
    setError(null)
    const { error: updateError } = await supabase.from("documents").update({ folder_id: destination }).eq("id", id)
    if (updateError) {
      setError(updateError.message)
      return
    }
    setMovingDocument(null)
    await loadFolder()
  }

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes
    const query = searchQuery.toLowerCase()
    return notes.filter((note) => note.title.toLowerCase().includes(query))
  }, [notes, searchQuery])

  const quickMoveFolders = useMemo(
    () => folders.filter((folder) => folder.id !== folderId).sort((a, b) => a.name.localeCompare(b.name)),
    [folders, folderId],
  )

  const movingDocumentData = useMemo(
    () => (movingDocument ? notes.find((note) => note.id === movingDocument) ?? null : null),
    [movingDocument, notes],
  )

  if (!folderId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-6 text-center text-destructive bg-destructive/10 border border-destructive/30">
          Invalid folder identifier.
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button size="icon" variant="ghost">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{folder?.name ?? "Folder"}</h1>
            {folder?.description && <p className="text-sm text-muted-foreground mt-1">{folder.description}</p>}
            <p className="text-muted-foreground mt-1">
              {loading ? "Loading notes..." : `${notes.length} note${notes.length === 1 ? "" : "s"} in this folder`}
            </p>
          </div>
        </div>

        {error && (
          <Card className="border border-destructive/30 bg-destructive/10 text-destructive text-sm p-4">{error}</Card>
        )}

        {/* Search and Create */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input border-border text-foreground"
            />
          </div>
          <Button
            onClick={handleCreateNote}
            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
            disabled={loading}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>

        {/* Notes List */}
        {loading ? (
          <Card className="bg-card border border-border p-6 text-center text-muted-foreground">Loading notes…</Card>
        ) : filteredNotes.length > 0 ? (
          <div className="space-y-3">
            {filteredNotes.map((note) => (
              <DocumentCard
                key={note.id}
                document={{
                  id: note.id,
                  title: note.title,
                  subtitle: `Created ${formatTimeAgo(note.createdAt)}`,
                  lastUpdated: note.lastUpdated,
                }}
                onView={handleViewDocument}
                onDelete={handleDeleteDocument}
                onMove={quickMoveFolders.length ? (id) => setMovingDocument(id) : undefined}
                onRemoveFromFolder={(id) => handleMoveDocument(id, null)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground mb-4">No notes found in this folder</p>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleCreateNote}
            >
              Create your first note
            </Button>
          </div>
        )}
      </div>

      <MoveDocumentDialog
        open={Boolean(movingDocument)}
        onOpenChange={(open) => {
          if (!open) setMovingDocument(null)
        }}
        folders={quickMoveFolders}
        documentTitle={movingDocumentData?.title ?? null}
        onMove={(folderId) => {
          if (!movingDocument) return
          void handleMoveDocument(movingDocument, folderId)
        }}
      />
    </div>
  )
}
