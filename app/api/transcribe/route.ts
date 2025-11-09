import { NextResponse } from "next/server"

export const runtime = "nodejs"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable")
}

const MODEL = "whisper-1"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Audio file is required." }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const openAiForm = new FormData()
    openAiForm.append("file", new Blob([buffer]), file.name || "audio.webm")
    openAiForm.append("model", MODEL)
    openAiForm.append("response_format", "json")

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: openAiForm,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      const message = typeof error?.error?.message === "string" ? error.error.message : "Transcription failed."
      return NextResponse.json({ error: message }, { status: response.status })
    }

    const data = await response.json()
    const transcript = typeof data?.text === "string" ? data.text : ""

    return NextResponse.json({ transcript })
  } catch (error) {
    console.error("transcribe error", error)
    return NextResponse.json({ error: "Unexpected error during transcription." }, { status: 500 })
  }
}
