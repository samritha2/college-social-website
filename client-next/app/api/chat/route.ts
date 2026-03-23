import { StreamingTextResponse, streamText } from "ai"
import { google } from "@ai-sdk/google"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    // In ai@3, the correct streaming pattern for App Router is:
    // 1. await streamText(...) to get StreamTextResult
    // 2. wrap result.textStream in StreamingTextResponse
    const result = await streamText({
      model: google("gemini-2.0-flash"),
      system:
        "You are a helpful AI assistant for CollegeSocial — a platform for college students. Help users with questions about college life, clubs, events, and anything else they need.",
      messages,
    })

    return new StreamingTextResponse(result.textStream)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"

    if (message.toLowerCase().includes("quota")) {
      return NextResponse.json(
        {
          error:
            "⚠️ Gemini API free-tier quota exceeded. Please wait a moment and try again.",
        },
        { status: 429 }
      )
    }

    if (message.includes("API key") || message.includes("apiKey") || message.includes("api key")) {
      return NextResponse.json(
        { error: "❌ Invalid or missing GOOGLE_GENERATIVE_AI_API_KEY in .env.local" },
        { status: 401 }
      )
    }

    console.error("[/api/chat]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
