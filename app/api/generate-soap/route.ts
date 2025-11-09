import { NextResponse } from "next/server"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable")
}

const MODEL = "gpt-4o-mini"

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const notes = typeof payload?.notes === "string" ? payload.notes.trim() : ""

    if (!notes) {
      return NextResponse.json({ error: "Notes field is required." }, { status: 400 })
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        response_format: { type: "json_object" },
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You are a clinical documentation assistant. Extract key details from the provided note or transcript and return a JSON object with the keys subjective, objective, assessment, and plan. Each value should be a concise paragraph in plain text. Do not include any additional keys.",
          },
          {
            role: "user",
            content: notes,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      const message = typeof error?.error?.message === "string" ? error.error.message : "Failed to generate SOAP note."
      return NextResponse.json({ error: message }, { status: response.status })
    }

    const completion = await response.json()
    const content = completion?.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: "The AI response was empty." }, { status: 500 })
    }

    let parsed
    try {
      parsed = JSON.parse(content)
    } catch (error) {
      return NextResponse.json({ error: "Unable to parse AI response." }, { status: 500 })
    }

    const { subjective, objective, assessment, plan } = parsed || {}

    if (!subjective || !objective || !assessment || !plan) {
      return NextResponse.json({ error: "AI response missing required sections." }, { status: 500 })
    }

    return NextResponse.json({ subjective, objective, assessment, plan })
  } catch (error) {
    console.error("generate-soap error", error)
    return NextResponse.json({ error: "Unexpected error generating SOAP note." }, { status: 500 })
  }
}
