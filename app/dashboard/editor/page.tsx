"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Loader2, Mic, MicOff, TriangleAlert } from "lucide-react"
import Link from "next/link"

export default function EditorPage() {
  const [rawNotes, setRawNotes] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [generatedSoap, setGeneratedSoap] = useState<{
    subjective: string
    objective: string
    assessment: string
    plan: string
  } | null>(null)

  const handleGenerateSoapNotes = async () => {
    if (!rawNotes.trim()) return

    setIsGenerating(true)
    setGenerationError(null)

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
    } catch (error) {
      console.error("generate-soap", error)
      setGenerationError("Unexpected error generating the SOAP note. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleToggleRecording = () => {
    setIsRecording((prev) => !prev)
    // TODO: Integrate speech-to-text service and update raw notes when transcription is available.
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
            {/* SOAP Sections */}
            {[
              { key: "subjective" as const, label: "Subjective", color: "border-l-blue-500" },
              { key: "objective" as const, label: "Objective", color: "border-l-green-500" },
              { key: "assessment" as const, label: "Assessment", color: "border-l-orange-500" },
              { key: "plan" as const, label: "Plan", color: "border-l-purple-500" },
            ].map((section) => (
              <Card key={section.key} className={`bg-card border border-border p-6 ${section.color} border-l-4`}>
                <h3 className="text-lg font-semibold mb-3 text-foreground">{section.label}</h3>
                <p className="text-foreground whitespace-pre-wrap">{generatedSoap[section.key]}</p>
              </Card>
            ))}

            <div className="flex gap-3">
              <Button onClick={() => setGeneratedSoap(null)} variant="outline">
                Back to Input
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Note</Button>
            </div>
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
                  className={`justify-center md:justify-start bg-transparent ${
                    isRecording ? "border-destructive text-destructive" : ""
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                  {isRecording ? "Stop Dictation" : "Start Dictation"}
                </Button>
              </div>
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
                  disabled={!rawNotes.trim() || isGenerating}
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
