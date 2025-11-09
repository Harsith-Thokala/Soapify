"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send, Stethoscope, Loader2 } from "lucide-react"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const sendPrompt = async (prompt: string) => {
    if (!prompt.trim()) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/clinical-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation: [...messages, userMessage].map((message) => ({ role: message.role, content: message.content })),
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        const message = typeof error?.error === "string" ? error.error : "Unable to contact the assistant."
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `⚠️ ${message}`,
          },
        ])
        setIsLoading(false)
        return
      }

      const data = await response.json()
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("chatbot", error)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "⚠️ Unexpected error reaching the assistant. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    void sendPrompt(input)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-border bg-card p-4 md:p-6">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Stethoscope className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Assistant</h1>
            <p className="text-sm text-muted-foreground">
              Ask clinical questions, gather differentials, or craft patient education in real time.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-6xl mx-auto h-full flex flex-col gap-4 p-4 md:p-6">
          <div className="flex-1 overflow-auto space-y-4 min-h-[220px]">
            {messages.length === 0 && (
              <Card className="p-6 text-center text-muted-foreground border border-border bg-card">
                Start the conversation with a clinical question or scenario.
              </Card>
            )}

            {messages.map((message) => (
              <Card
                key={message.id}
                className={`p-4 border ${message.role === "user" ? "bg-primary/5 border-primary/40" : "bg-card border-border"}`}
              >
                <p className="text-xs uppercase text-muted-foreground mb-1">
                  {message.role === "user" ? "Doctor" : "Assistant"}
                </p>
                <p className="text-sm whitespace-pre-wrap text-foreground">{message.content}</p>
              </Card>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a clinical clarifying question, request differentials, or draft patient instructions..."
              className="min-h-28 bg-background border border-border text-foreground placeholder-muted-foreground"
            />
            <div className="flex items-center justify-end">
              <Button type="submit" disabled={!input.trim() || isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="ml-2">Send</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
