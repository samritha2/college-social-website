"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Layout from "@/components/Layout"
import { toast } from "react-hot-toast"

interface Club { id: number; club_name: string }

export default function CreatePostPage() {
  const [clubId,  setClubId]  = useState("")
  const [content, setContent] = useState("")
  const [image,   setImage]   = useState("")
  const [clubs,   setClubs]   = useState<Club[]>([])
  const [loading, setLoading] = useState(false)
  const [role,    setRole]    = useState("")

  useEffect(() => {
    axios.get("http://localhost:5000/api/clubs/all").then(r => setClubs(r.data)).catch(() => {})
    const t = localStorage.getItem("token")
    if (t) { try { const p = JSON.parse(atob(t.split(".")[1])); setRole(p.role) } catch { /* ignore */ } }
  }, [])

  if (role && role !== "club_admin") {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-2xl mb-4">🚫</div>
          <p className="text-slate-800 font-semibold text-lg">Access Restricted</p>
          <p className="text-slate-400 text-sm mt-1">Only club admins can create posts.</p>
        </div>
      </Layout>
    )
  }

  const handleCreate = async () => {
    if (!clubId || !content.trim()) { toast.error("Please select a club and add content"); return }
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      await axios.post("http://localhost:5000/api/posts/create",
        { club_id: clubId, content, image },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success("Post published! 🎉")
      setClubId(""); setContent(""); setImage("")
    } catch {
      toast.error("Failed to create post")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl animate-fadeInUp">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Create Post</h1>
          <p className="text-slate-500 text-sm mt-1">Share news and updates with your club followers</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          {/* Club selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Club</label>
            <select
              value={clubId}
              onChange={e => setClubId(e.target.value)}
              className="input-primary w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm appearance-none"
            >
              <option value="">Select a club…</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.club_name}</option>)}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Content</label>
            <textarea
              value={content}
              rows={5}
              placeholder="What's happening at your club?"
              onChange={e => setContent(e.target.value)}
              className="input-primary w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm resize-none"
            />
            <p className="text-right text-xs text-slate-400 mt-1">{content.length} chars</p>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
              Image URL <span className="normal-case font-normal text-slate-400">(optional)</span>
            </label>
            <input
              type="url"
              value={image}
              placeholder="https://…"
              onChange={e => setImage(e.target.value)}
              className="input-primary w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm"
            />
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="Preview" className="mt-3 w-full h-40 object-cover rounded-xl" onError={e => (e.currentTarget.style.display="none")} />
            )}
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Publishing…
              </span>
            ) : "Publish Post ✎"}
          </button>
        </div>
      </div>
    </Layout>
  )
}
