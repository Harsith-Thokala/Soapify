import { NextResponse } from "next/server"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable")
}

const MODEL = "gpt-4o-mini"

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const section = typeof payload?.section === "string" ? payload.section : ""
    const content = typeof payload?.content === "string" ? payload.content.trim() : ""
    const title = typeof payload?.title === "string" ? payload.title.trim() : "Clinical note"

    if (!content) {
      return NextResponse.json({ error: "Section content is required." }, { status: 400 })
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You analyse SOAP note sections for clinicians. Explain the reasoning behind the provided text in 2-3 concise bullet points. Highlight key clinical clues, risk factors, and decision branches. Do not restate the entire section; focus on rationale.",
          },
          {
            role: "user",
            content: `Note title: ${title}\nSection: ${section}\nContent: ${content}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      const message = typeof error?.error?.message === "string" ? error.error.message : "Explanation request failed."
      return NextResponse.json({ error: message }, { status: response.status })
    }

    const completion = await response.json()
    const explanation = completion?.choices?.[0]?.message?.content?.trim()

    if (!explanation) {
      return NextResponse.json({ error: "Assistant returned an empty explanation." }, { status: 500 })
    }

    return NextResponse.json({ explanation })
  } catch (error) {
    console.error("explain-soap error", error)
    return NextResponse.json({ error: "Unexpected error explaining this section." }, { status: 500 })
  }
}
