"use client"

import { useChat } from "ai/react"
import { useState } from "react"

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
      onError: (err) => {
        setApiError(err.message || "Something went wrong. Please try again.")
      },
    })

  return (
    <>
      {/* FLOATING TOGGLE BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-600 text-white text-2xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center"
        title="Chat with AI"
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* CHAT PANEL */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-indigo-100">
          {/* HEADER */}
          <div className="bg-indigo-600 text-white px-4 py-3 flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <div>
              <p className="font-semibold text-sm">CollegeSocial AI</p>
              <p className="text-xs text-indigo-200">Powered by Gemini</p>
            </div>
          </div>

          {/* ERROR BANNER */}
          {apiError && (
            <div className="mx-3 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex justify-between items-start gap-1">
              <span>{apiError}</span>
              <button onClick={() => setApiError(null)} className="shrink-0 text-red-400 hover:text-red-600">✕</button>
            </div>
          )}

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-72 bg-gray-50">
            {messages.length === 0 && (
              <p className="text-center text-sm text-gray-400 mt-8">
                Ask me anything about college life! 🎓
              </p>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "bg-indigo-500 text-white rounded-br-sm"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-gray-400">
                  Thinking…
                </div>
              </div>
            )}
          </div>

          {/* INPUT FORM */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 p-3 border-t border-gray-100 bg-white"
          >
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Type a message…"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-indigo-500 text-white px-3 py-2 rounded-xl hover:bg-indigo-600 transition disabled:opacity-50"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  )
}
