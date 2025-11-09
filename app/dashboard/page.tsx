"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FolderCard } from "@/components/folder-card"
import { CreateFolderModal } from "@/components/create-folder-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Files, FolderPlus, ListFilter, Plus, Search } from "lucide-react"
import { FileText } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

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

interface Folder {
  id: string
  name: string
  notes: number
  lastUpdated: string
  updatedAt: string
  description?: string
}

interface Note {
  id: string
  name: string
  folderId?: string
  lastUpdated: string
  updatedAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"overview" | "folders" | "documents">("overview")
  const [folders, setFolders] = useState<Folder[]>([])
  const [documents, setDocuments] = useState<Note[]>([])
  const [dashboardQuery, setDashboardQuery] = useState("")
  const [folderQuery, setFolderQuery] = useState("")
  const [documentQuery, setDocumentQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [creatingDocument, setCreatingDocument] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadError(null)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      setLoadError(userError.message)
      setLoading(false)
      return
    }

    if (!user) {
      router.push("/auth/login")
      setLoading(false)
      return
    }

    setUserId(user.id)

    const [folderResponse, documentResponse] = await Promise.all([
      supabase
        .from("folders")
        .select("id, name, description, updated_at, created_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("documents")
        .select("id, title, folder_id, updated_at, created_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false }),
    ])

    if (folderResponse.error || documentResponse.error) {
      setLoadError(folderResponse.error?.message ?? documentResponse.error?.message ?? "Unable to load workspace data.")
      setLoading(false)
      return
    }

    const docs =
      documentResponse.data?.map((doc) => {
        const updated = doc.updated_at ?? doc.created_at
        return {
          id: doc.id,
          name: doc.title ?? "Untitled Note",
          folderId: doc.folder_id ?? undefined,
          updatedAt: updated ?? new Date().toISOString(),
          lastUpdated: formatTimeAgo(updated),
        }
      }) ?? []

    const docCounts = docs.reduce<Record<string, number>>((acc, doc) => {
      if (doc.folderId) {
        acc[doc.folderId] = (acc[doc.folderId] ?? 0) + 1
      }
      return acc
    }, {})

    const folderData =
      folderResponse.data?.map((folder) => {
        const updated = folder.updated_at ?? folder.created_at
        return {
          id: folder.id,
          name: folder.name,
          notes: docCounts[folder.id] ?? 0,
          lastUpdated: formatTimeAgo(updated),
          updatedAt: updated ?? new Date().toISOString(),
          description: folder.description ?? undefined,
        }
      }) ?? []

    setDocuments(docs)
    setFolders(folderData)
    setLoading(false)
  }, [router])

  useEffect(() => {
    if (isMounted) {
      void loadData()
    }
  }, [isMounted, loadData])

  const handleCreateFolder = async (name: string, description?: string) => {
    if (!userId) {
      setLoadError("You must be signed in to create folders.")
      return
    }

    setLoadError(null)

    const { error } = await supabase.from("folders").insert({
      name,
      description: description || null,
      user_id: userId,
    })

    if (error) {
      setLoadError(error.message)
      return
    }

    setShowCreateModal(false)
    await loadData()
  }

  const handleDeleteFolder = async (id: string) => {
    if (!userId) return
    setLoadError(null)

    const { error } = await supabase.from("folders").delete().eq("id", id).eq("user_id", userId)
    if (error) {
      setLoadError(error.message)
      return
    }
    await loadData()
  }

  const handleCreateDocument = async (folderId?: string) => {
    if (!userId) {
      setLoadError("You must be signed in to create documents.")
      return
    }
    setCreatingDocument(true)
    setLoadError(null)

    const { data, error } = await supabase
      .from("documents")
      .insert({
        user_id: userId,
        folder_id: folderId ?? null,
        title: "Untitled Note",
        content: {},
      })
      .select("id")
      .single()

    if (error || !data) {
      setLoadError(error?.message ?? "Unable to create document.")
      setCreatingDocument(false)
      return
    }

    setCreatingDocument(false)
    router.push(`/dashboard/editor?doc=${data.id}`)
  }

  const foldersTabFiltered = useMemo(() => {
    const query = folderQuery.trim().toLowerCase()
    const list = !query
      ? folders
      : folders.filter(
      (folder) =>
        folder.name.toLowerCase().includes(query) ||
        folder.description?.toLowerCase().includes(query) ||
        folder.lastUpdated.toLowerCase().includes(query),
        )
    return [...list].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [folders, folderQuery])

  const documentsTabFiltered = useMemo(() => {
    const query = documentQuery.trim().toLowerCase()
    const list = !query
      ? documents
      : documents.filter((doc) => doc.name.toLowerCase().includes(query) || doc.lastUpdated.toLowerCase().includes(query))
    return [...list].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [documents, documentQuery])

  return (
    !isMounted ? (
      <div className="p-6 md:p-8">
        <div className="h-10 w-40 rounded-md bg-muted animate-pulse" />
      </div>
    ) : (
    <div className="p-6 md:p-8 space-y-8">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Workspace</h1>
            <p className="text-muted-foreground mt-1">Manage your folders and SOAP documents in one place.</p>
          </div>
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="folders">Folders</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
        </div>

        {loadError && (
          <Card className="border border-destructive/30 bg-destructive/10 text-destructive text-sm p-4">
            {loadError}
          </Card>
        )}

        <TabsContent value="overview" className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={dashboardQuery}
                onChange={(event) => {
                  const value = event.target.value
                  setDashboardQuery(value)
                  setFolderQuery(value)
                  setDocumentQuery(value)
                }}
                placeholder="Search folders or documents..."
                className="pl-9 bg-input border-border text-foreground"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                New Folder
              </Button>
              <Button variant="outline" onClick={() => setActiveTab("folders")} className="bg-transparent">
                <ListFilter className="w-4 h-4 mr-2" />
                View Folders
              </Button>
            </div>
          </div>

          {loading && (
            <Card className="bg-card border border-border p-4 text-sm text-muted-foreground">
              Loading workspace data...
            </Card>
          )}

          {!loading && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Folders</h2>
              </div>
              {foldersTabFiltered.length === 0 ? (
                <Card className="bg-card border border-dashed border-border p-6 text-center space-y-2 text-muted-foreground">
                  No folders yet. Create one to start organizing your SOAP notes.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {foldersTabFiltered.slice(0, 3).map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    onDelete={handleDeleteFolder}
                    onCreateNote={(id) => handleCreateDocument(id)}
                    viewMode="grid"
                  />
                  ))}
                </div>
              )}
            </section>
          )}

          {!loading && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Documents</h2>
                {documentsTabFiltered.length > 0 && (
                  <Button variant="link" className="px-0 text-primary" onClick={() => setActiveTab("documents")}>
                    View all documents
                  </Button>
                )}
              </div>
              {documentsTabFiltered.length === 0 ? (
                <Card className="bg-card border border-dashed border-border p-6 text-center space-y-2 text-muted-foreground">
                  No documents yet. Use the SOAP generator to create your first note.
                </Card>
              ) : (
                <div className="space-y-2">
                  {documentsTabFiltered.slice(0, 5).map((note) => (
                    <Link key={note.id} href="/dashboard/editor">
                      <Card className="p-4 bg-card border border-border hover:border-primary hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground truncate hover:text-primary transition-colors">
                              {note.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">Updated {note.lastUpdated}</p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}
        </TabsContent>

        <TabsContent value="folders" className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={folderQuery}
                onChange={(event) => setFolderQuery(event.target.value)}
                placeholder="Search folders..."
                className="pl-9 bg-input border-border text-foreground"
              />
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
          </div>

          {loading ? (
            <Card className="bg-card border border-border p-6 text-center text-muted-foreground">
              Loading folders...
            </Card>
          ) : foldersTabFiltered.length === 0 ? (
            <Card className="bg-card border border-dashed border-border p-8 text-center space-y-3">
              <FolderPlus className="w-8 h-8 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">You haven&apos;t created any folders yet.</p>
              <Button onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Create your first folder
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {foldersTabFiltered.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  onDelete={handleDeleteFolder}
                  onCreateNote={(id) => handleCreateDocument(id)}
                  viewMode="grid"
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={documentQuery}
                onChange={(event) => setDocumentQuery(event.target.value)}
                placeholder="Search documents..."
                className="pl-9 bg-input border-border text-foreground"
              />
            </div>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => handleCreateDocument()}
              disabled={creatingDocument}
            >
              <Files className="w-4 h-4 mr-2" />
              {creatingDocument ? "Creating..." : "New Document"}
            </Button>
          </div>

          {loading ? (
            <Card className="bg-card border border-border p-6 text-center text-muted-foreground">
              Loading documents...
            </Card>
          ) : documentsTabFiltered.length === 0 ? (
            <Card className="bg-card border border-dashed border-border p-8 text-center space-y-3">
              <FileText className="w-8 h-8 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">No SOAP documents yet. Generate your first note to see it listed here.</p>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => handleCreateDocument()}
                disabled={creatingDocument}
              >
                {creatingDocument ? "Creating..." : "Create a new note"}
              </Button>
            </Card>
          ) : (
            <div className="space-y-2">
              {documentsTabFiltered.map((note) => (
                <Link key={note.id} href="/dashboard/editor">
                  <Card className="p-4 bg-card border border-border hover:border-primary hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate hover:text-primary transition-colors">{note.name}</h3>
                        <p className="text-sm text-muted-foreground">Updated {note.lastUpdated}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateFolderModal open={showCreateModal} onOpenChange={setShowCreateModal} onCreate={handleCreateFolder} />
    </div>
    )
  )
}
