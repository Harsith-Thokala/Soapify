"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Loader2, Mic, MicOff, TriangleAlert } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

export default function EditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const folderParam = searchParams.get("folder")
  const documentParam = searchParams.get("doc")

  const [rawNotes, setRawNotes] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [folderId, setFolderId] = useState<string | null>(folderParam)
  const [noteTitle, setNoteTitle] = useState("Untitled Note")
  const [editingSection, setEditingSection] = useState<"subjective" | "objective" | "assessment" | "plan" | null>(null)
  const [sectionDraft, setSectionDraft] = useState("")
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [recordError, setRecordError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [explanations, setExplanations] = useState<{
    subjective: { loading: boolean; text: string | null; error: string | null }
    objective: { loading: boolean; text: string | null; error: string | null }
    assessment: { loading: boolean; text: string | null; error: string | null }
    plan: { loading: boolean; text: string | null; error: string | null }
  }>({
    subjective: { loading: false, text: null, error: null },
    objective: { loading: false, text: null, error: null },
    assessment: { loading: false, text: null, error: null },
    plan: { loading: false, text: null, error: null },
  })
  const [generatedSoap, setGeneratedSoap] = useState<{
    subjective: string
    objective: string
    assessment: string
    plan: string
  } | null>(null)

  useEffect(() => {
    if (documentParam) {
      setDocumentId(documentParam)
    }
    if (folderParam) {
      setFolderId(folderParam)
    }
  }, [documentParam, folderParam])

  useEffect(() => {
    const loadDocument = async () => {
      if (!documentParam) return

      const { data, error } = await supabase
        .from("documents")
        .select("content, folder_id, title")
        .eq("id", documentParam)
        .maybeSingle()

      if (error) {
        console.error("load-document", error)
        setSaveError("Unable to load this document.")
        return
      }

      if (data?.content && typeof data.content === "object") {
        setGeneratedSoap(data.content as {
          subjective: string
          objective: string
          assessment: string
          plan: string
        })
      }

      if (typeof data?.folder_id === "string") {
        setFolderId(data.folder_id)
      }

      if (typeof data?.title === "string" && data.title.trim().length > 0) {
        setNoteTitle(data.title)
      }
    }

    void loadDocument()
  }, [documentParam])

  const upsertDocument = useCallback(
    async (payload: { title: string; content: Record<string, string>; folder_id: string | null }) => {
      if (documentId) {
        const { error } = await supabase
          .from("documents")
          .update({ title: payload.title, content: payload.content, folder_id: payload.folder_id })
          .eq("id", documentId)

        if (error) throw error
        return documentId
      }

      const {
        data: authData,
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) throw authError
      const userId = authData.user?.id

      if (!userId) {
        throw new Error("You must be signed in to save notes.")
      }

      const {
        data,
        error,
      } = await supabase
        .from("documents")
        .insert({ title: payload.title, content: payload.content, folder_id: payload.folder_id, user_id: userId })
        .select("id")
        .single()

      if (error || !data) throw error ?? new Error("Unable to create document.")
      setDocumentId(data.id)
      return data.id
    },
    [documentId],
  )

  const handleSaveNote = async () => {
    if (!generatedSoap) return

    setSaveError(null)
    setIsSaving(true)

    try {
      const title = noteTitle.trim() || "Untitled Note"

      const docId = await upsertDocument({
        title,
        content: generatedSoap,
        folder_id: folderId,
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("save-note", error)
      setSaveError("Unable to save the document. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateSoapNotes = async () => {
    if (!rawNotes.trim()) return

    setIsGenerating(true)
    setGenerationError(null)
    setSaveError(null)

    try {
      const response = await fetch("/api/generate-soap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: rawNotes }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        const message = typeof error?.error === "string" ? error.error : "Failed to generate SOAP note."
        setGenerationError(message)
        setIsGenerating(false)
        return
      }

      const data = await response.json()
      setGeneratedSoap({
        subjective: data.subjective,
        objective: data.objective,
        assessment: data.assessment,
        plan: data.plan,
      })
      setEditingSection(null)
      setExplanations({
        subjective: { loading: false, text: null, error: null },
        objective: { loading: false, text: null, error: null },
        assessment: { loading: false, text: null, error: null },
        plan: { loading: false, text: null, error: null },
      })
    } catch (error) {
      console.error("generate-soap", error)
      setGenerationError("Unexpected error generating the SOAP note. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true)
    setRecordError(null)
    try {
      const file = new File([audioBlob], "dictation.webm", { type: audioBlob.type || "audio/webm" })
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        const message = typeof error?.error === "string" ? error.error : "Unable to transcribe audio."
        setRecordError(message)
        return
      }

      const data = await response.json()
      if (typeof data?.transcript === "string" && data.transcript.trim().length > 0) {
        setRawNotes((prev) => {
          const existing = prev.trim()
          return existing ? `${existing}\n\n${data.transcript}` : data.transcript
        })
      } else {
        setRecordError("No speech detected in the recording.")
      }
    } catch (error) {
      console.error("transcribe", error)
      setRecordError("Unexpected error during transcription. Ensure your microphone permissions are granted and try again.")
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleToggleRecording = async () => {
    if (isTranscribing) return
    setRecordError(null)

    if (isRecording) {
      setIsRecording(false)
      mediaRecorderRef.current?.stop()
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error("mediaRecorder", event.error)
        setRecordError("Recording error: " + event.error?.message)
        setIsRecording(false)
      }

      mediaRecorder.onstop = async () => {
        stopStream()
        const chunks = audioChunksRef.current
        audioChunksRef.current = []
        if (chunks.length > 0) {
          const audioBlob = new Blob(chunks, { type: "audio/webm" })
          await transcribeAudio(audioBlob)
        }
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("recording", error)
      setRecordError("Microphone access denied or unavailable.")
      stopStream()
      setIsRecording(false)
    }
  }

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop()
      stopStream()
    }
  }, [])

  const startEditingSection = (key: "subjective" | "objective" | "assessment" | "plan") => {
    if (!generatedSoap) return
    setEditingSection(key)
    setSectionDraft(generatedSoap[key])
  }

  const cancelEditingSection = () => {
    setEditingSection(null)
    setSectionDraft("")
  }

  const saveEditingSection = () => {
    if (!generatedSoap || !editingSection) return
    setGeneratedSoap({ ...generatedSoap, [editingSection]: sectionDraft })
    setEditingSection(null)
    setSectionDraft("")
  }

  const explainSection = async (key: "subjective" | "objective" | "assessment" | "plan") => {
    if (!generatedSoap) return
    setExplanations((prev) => ({
      ...prev,
      [key]: { loading: true, text: prev[key].text, error: null },
    }))

    try {
      const response = await fetch("/api/explain-soap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: key,
          content: generatedSoap[key],
          title: noteTitle,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        const message = typeof error?.error === "string" ? error.error : "Unable to explain this section."
        setExplanations((prev) => ({
          ...prev,
          [key]: { loading: false, text: prev[key].text, error: message },
        }))
        return
      }

      const data = await response.json()
      setExplanations((prev) => ({
        ...prev,
        [key]: { loading: false, text: data.explanation, error: null },
      }))
    } catch (error) {
      console.error("explain-section", error)
      setExplanations((prev) => ({
        ...prev,
        [key]: { loading: false, text: prev[key].text, error: "Unexpected error explaining this section." },
      }))
    }
  }

  if (generatedSoap) {
    return (
      <div className="h-full flex flex-col bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card p-4 md:p-6">
          <div className="flex items-center gap-3 max-w-7xl mx-auto">
            <Link href="/dashboard">
              <Button size="icon" variant="ghost">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Generated SOAP Note</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 md:p-8 bg-background">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="note-title">
                Note Title
              </label>
              <Input
                id="note-title"
                value={noteTitle}
                onChange={(event) => setNoteTitle(event.target.value)}
                placeholder="Enter a descriptive title"
                className="bg-input border border-border text-foreground"
              />
            </div>

            {/* SOAP Sections */}
            {[
              { key: "subjective" as const, label: "Subjective", color: "border-l-blue-500" },
              { key: "objective" as const, label: "Objective", color: "border-l-green-500" },
              { key: "assessment" as const, label: "Assessment", color: "border-l-orange-500" },
              { key: "plan" as const, label: "Plan", color: "border-l-purple-500" },
            ].map((section) => {
              const isEditing = editingSection === section.key
              return (
                <Card key={section.key} className={`bg-card border border-border p-6 ${section.color} border-l-4 space-y-4`}>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-foreground mt-1">{section.label}</h3>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button size="sm" onClick={saveEditingSection}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditingSection}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => startEditingSection(section.key)}>
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => explainSection(section.key)}
                            disabled={explanations[section.key].loading}
                          >
                            {explanations[section.key].loading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Explain"
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {isEditing ? (
                    <Textarea
                      value={sectionDraft}
                      onChange={(event) => setSectionDraft(event.target.value)}
                      className="min-h-32 bg-background border border-border text-foreground"
                    />
                  ) : (
                    <p className="text-foreground whitespace-pre-wrap">{generatedSoap[section.key]}</p>
                  )}
                  {!isEditing && explanations[section.key].text && (
                    <div className="rounded-md border border-muted bg-muted/40 p-3 text-sm text-muted-foreground">
                      {explanations[section.key].text}
                    </div>
                  )}
                  {!isEditing && explanations[section.key].error && (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                      {explanations[section.key].error}
                    </div>
                  )}
                </Card>
              )
            })}

            <div className="flex gap-3">
              <Button onClick={() => setGeneratedSoap(null)} variant="outline">
                Back to Input
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleSaveNote}
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isSaving ? "Saving..." : "Save Note"}
              </Button>
            </div>

            {saveError && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                <TriangleAlert className="w-4 h-4 mt-0.5" />
                <span>{saveError}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card p-4 md:p-6">
        <div className="flex items-center gap-3 max-w-7xl mx-auto">
          <Link href="/dashboard">
            <Button size="icon" variant="ghost">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Create New Note</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 md:p-8 bg-background">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="bg-card border border-border p-6 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground" htmlFor="note-title-input">
                Note Title
              </label>
              <Input
                id="note-title-input"
                value={noteTitle}
                onChange={(event) => setNoteTitle(event.target.value)}
                placeholder="Enter a descriptive title"
                className="bg-input border border-border text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Raw Notes</label>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Type or dictate your clinical notes. We'll convert them into SOAP format.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleToggleRecording}
                  aria-pressed={isRecording}
                  disabled={isTranscribing}
                  className={`justify-center md:justify-start bg-transparent ${
                    isRecording ? "border-destructive text-destructive" : ""
                  }`}
                >
                  {isTranscribing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : isRecording ? (
                    <MicOff className="w-4 h-4 mr-2" />
                  ) : (
                    <Mic className="w-4 h-4 mr-2" />
                  )}
                  {isTranscribing ? "Transcribing..." : isRecording ? "Stop Dictation" : "Start Dictation"}
                </Button>
              </div>
              {recordError && (
                <div className="text-sm text-destructive">{recordError}</div>
              )}
              <Textarea
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                placeholder="Enter your raw clinical notes here..."
                className="min-h-64 bg-background border border-border text-foreground placeholder-muted-foreground resize-none"
              />
              <div className="text-xs text-muted-foreground mt-2">
                {rawNotes.split(/\s+/).filter((w) => w.length > 0).length} words
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    Cancel
                  </Button>
                </Link>
                <Button
                  onClick={handleGenerateSoapNotes}
                  disabled={!rawNotes.trim() || isGenerating || isTranscribing}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isGenerating ? "Generating..." : "Generate SOAP Notes"}
                </Button>
              </div>

              {generationError && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  <TriangleAlert className="w-4 h-4 mt-0.5" />
                  <span>{generationError}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
