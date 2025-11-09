"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wand2, Loader2, Check } from "lucide-react"
import { Card } from "@/components/ui/card"

interface SOAP {
  subjective: string
  objective: string
  assessment: string
  plan: string
}

interface AIAssistModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  soap: SOAP
  setSoap: (soap: SOAP) => void
}

export function AIAssistModal({ open, onOpenChange, soap, setSoap }: AIAssistModalProps) {
  const [activeTab, setActiveTab] = useState("generate")
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const handleGenerate = async () => {
    setIsLoading(true)
    // Simulate AI generation
    setTimeout(() => {
      const newSoap = {
        subjective: "Patient presents with " + input + ". States symptoms have been present for several days.",
        objective:
          "Vital signs: BP 120/80 mmHg, HR 72 bpm, RR 16, Temp 98.6°F. Physical examination unremarkable. No abnormal findings noted.",
        assessment:
          "Provisional diagnosis based on presenting symptoms and clinical findings. Further investigation may be warranted. Rule out differential diagnoses.",
        plan: "Continue current treatment regimen. Recommend rest and hydration. Follow-up appointment in 1-2 weeks. Patient advised to seek immediate care if symptoms worsen.",
      }
      setSoap(newSoap)
      setSuccessMessage("SOAP note generated successfully!")
      setIsLoading(false)
      setTimeout(() => {
        onOpenChange(false)
        setInput("")
        setSuccessMessage("")
      }, 1500)
    }, 2000)
  }

  const handleSummarize = async () => {
    setIsLoading(true)
    setTimeout(() => {
      setSuccessMessage("Content summarized successfully!")
      setSoap({
        ...soap,
        plan: "Continue monitoring. Follow-up as needed.",
      })
      setIsLoading(false)
      setTimeout(() => {
        setSuccessMessage("")
      }, 1500)
    }, 1500)
  }

  const handleImprove = async () => {
    setIsLoading(true)
    setTimeout(() => {
      setSuccessMessage("Writing improved successfully!")
      setSoap({
        ...soap,
        subjective: soap.subjective
          ? soap.subjective.replace(/\.\s*$/, ". Patient appears cooperative and communicative.")
          : "",
      })
      setIsLoading(false)
      setTimeout(() => {
        setSuccessMessage("")
      }, 1500)
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            AI Assist
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Get AI-powered assistance with your SOAP notes
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted border border-border">
            <TabsTrigger value="generate" className="text-foreground">
              Generate
            </TabsTrigger>
            <TabsTrigger value="summarize" className="text-foreground">
              Summarize
            </TabsTrigger>
            <TabsTrigger value="improve" className="text-foreground">
              Improve
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Chief Complaint & Summary</label>
              <Textarea
                placeholder="Describe the patient's chief complaint and symptoms. Example: 'Patient reports persistent headaches for 3 days, worse in mornings, accompanied by neck stiffness'"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-input border-border text-foreground min-h-32"
              />
              <p className="text-xs text-muted-foreground">AI will generate a complete SOAP note based on your input</p>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isLoading || !input.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate SOAP Note"
              )}
            </Button>
          </TabsContent>

          <TabsContent value="summarize" className="space-y-4 mt-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                AI will create a concise summary of your note. This is useful for quick reference.
              </p>
              <div className="bg-muted/50 p-3 rounded border border-border">
                <p className="text-xs text-muted-foreground mb-2">Current note status:</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Subjective: {soap.subjective.length > 0 ? "✓ Complete" : "Empty"}</li>
                  <li>• Objective: {soap.objective.length > 0 ? "✓ Complete" : "Empty"}</li>
                  <li>• Assessment: {soap.assessment.length > 0 ? "✓ Complete" : "Empty"}</li>
                  <li>• Plan: {soap.plan.length > 0 ? "✓ Complete" : "Empty"}</li>
                </ul>
              </div>
            </div>
            <Button
              onClick={handleSummarize}
              disabled={isLoading || !Object.values(soap).some((s) => s.trim())}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Summarizing...
                </>
              ) : (
                "Summarize Content"
              )}
            </Button>
          </TabsContent>

          <TabsContent value="improve" className="space-y-4 mt-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                AI will review and improve clarity, completeness, and professional tone of your note.
              </p>
              <Card className="bg-muted/30 border border-border p-3">
                <p className="text-xs font-semibold text-foreground mb-2">Improvements will include:</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>✓ Enhanced medical terminology</li>
                  <li>✓ Better clinical documentation</li>
                  <li>✓ Improved readability and flow</li>
                  <li>✓ Professional formatting</li>
                </ul>
              </Card>
            </div>
            <Button
              onClick={handleImprove}
              disabled={isLoading || !Object.values(soap).some((s) => s.trim())}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Improving...
                </>
              ) : (
                "Improve Writing"
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {successMessage && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded text-sm text-green-700">
            <Check className="w-4 h-4" />
            {successMessage}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
