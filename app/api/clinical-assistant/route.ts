import { NextResponse } from "next/server"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable")
}

const MODEL = "gpt-4o-mini"

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const conversation = Array.isArray(payload?.conversation) ? payload.conversation : []

    const messages = [
      {
        role: "system",
        content:
          "You are a concise clinical assistant supporting physicians during SOAP note creation. Provide evidence-informed guidance, suggest differentials, outline key follow-up questions, and highlight red flags. Answer clearly in paragraphs or bullet lists, and avoid adding actual prescriptions or claims of patient management.",
      },
      ...conversation.map((message: any) => ({
        role: message?.role === "assistant" ? "assistant" : "user",
        content: typeof message?.content === "string" ? message.content : "",
      })),
    ]

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        messages,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      const message = typeof error?.error?.message === "string" ? error.error.message : "Assistant request failed."
      return NextResponse.json({ error: message }, { status: response.status })
    }

    const completion = await response.json()
    const reply = completion?.choices?.[0]?.message?.content?.trim()

    if (!reply) {
      return NextResponse.json({ error: "Assistant returned an empty response." }, { status: 500 })
    }

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("clinical-assistant error", error)
    return NextResponse.json({ error: "Unexpected error contacting the assistant." }, { status: 500 })
  }
}
