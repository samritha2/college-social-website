"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import Layout from "@/components/Layout"
import { toast } from "react-hot-toast"

interface Post { id: number; club_name: string; content: string; image?: string; like_count: number }
interface Comment { id: number; name: string; comment: string }

export default function ClubPage() {
  const params  = useParams()
  const clubId  = params.clubId as string
  const router  = useRouter()

  const [posts,      setPosts]      = useState<Post[]>([])
  const [comments,   setComments]   = useState<Record<number, Comment[]>>({})
  const [role,       setRole]       = useState("")
  const [following,  setFollowing]  = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [clubName,   setClubName]   = useState("")

  const token = () => localStorage.getItem("token")
  const auth  = () => ({ headers: { Authorization: `Bearer ${token()}` } })

  useEffect(() => {
    const t = token()
    if (t) { try { const p = JSON.parse(atob(t.split(".")[1])); setRole(p.role) } catch { /* ignore */ } }

    Promise.all([
      axios.get(`http://localhost:5000/api/posts/club/${clubId}`),
      axios.get(`http://localhost:5000/api/followers/${clubId}`),
      t ? axios.get(`http://localhost:5000/api/followers/check/${clubId}`, auth()) : Promise.resolve({ data: { isFollowing: false } })
    ]).then(([postsRes, follRes, checkRes]) => {
      setPosts(postsRes.data)
      if (postsRes.data.length) setClubName(postsRes.data[0].club_name)
      setFollowerCount(follRes.data.followerCount)
      setFollowing(checkRes.data.isFollowing)
    }).catch(() => {}).finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId])

  const handleLike = async (postId: number) => {
    try {
      await axios.post("http://localhost:5000/api/likes/like", { post_id: postId }, auth())
      setPosts(p => p.map(post => post.id === postId ? { ...post, like_count: post.like_count + 1 } : post))
    } catch { toast.error("Already liked") }
  }
  const handleDelete = async (postId: number) => {
    try {
      await axios.delete(`http://localhost:5000/api/posts/delete/${postId}`, auth())
      setPosts(p => p.filter(post => post.id !== postId)); toast.success("Post deleted 🗑️")
    } catch { toast.error("Delete failed") }
  }
  const fetchComments = async (postId: number) => {
    const res = await axios.get(`http://localhost:5000/api/comments/${postId}`)
    setComments(p => ({ ...p, [postId]: res.data }))
  }
  const handleComment = async (postId: number, text: string) => {
    if (!text.trim()) return
    try {
      await axios.post("http://localhost:5000/api/comments/add",
        { post_id: postId, comment: text }, auth())
      fetchComments(postId)
    } catch { /* silent */ }
  }
  const handleFollow = async () => {
    try {
      await axios.post("http://localhost:5000/api/followers/follow", { club_id: clubId }, auth())
      setFollowing(true); setFollowerCount(c => c + 1); toast.success("Following! 🎉")
    } catch { toast.error("Already following") }
  }
  const handleUnfollow = async () => {
    try {
      await axios.post("http://localhost:5000/api/followers/unfollow", { club_id: clubId }, auth())
      setFollowing(false); setFollowerCount(c => Math.max(0, c - 1)); toast.success("Unfollowed")
    } catch { toast.error("Error") }
  }

  return (
    <Layout>
      {/* Club header */}
      <div className="mb-8 animate-fadeInUp">
        <button onClick={() => router.back()} className="text-sm text-slate-400 hover:text-slate-600 transition-colors mb-4 flex items-center gap-1">
          ← Back
        </button>
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white flex items-center justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-bold mb-3">
              {clubName ? clubName[0] : "?"}
            </div>
            <h1 className="text-2xl font-bold">{clubName || "Club"}</h1>
            <p className="text-indigo-200 text-sm mt-1">{followerCount} followers · {posts.length} posts</p>
          </div>
          <button
            onClick={following ? handleUnfollow : handleFollow}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 ${
              following
                ? "bg-white/20 text-white hover:bg-white/30"
                : "bg-white text-indigo-700 hover:bg-indigo-50"
            }`}
          >
            {following ? "Following ✓" : "+ Follow"}
          </button>
        </div>
      </div>

      {/* Posts */}
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4 animate-fadeInUp delay-50">Events &amp; Updates</h2>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[1,2].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse border border-slate-100 space-y-3">
              <div className="h-4 bg-slate-100 rounded w-1/3" />
              <div className="h-24 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl mb-4">📭</div>
          <p className="text-slate-700 font-semibold">No posts yet</p>
          <p className="text-slate-400 text-sm mt-1">This club hasn&apos;t posted anything yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {posts.map((post, i) => (
            <div key={post.id} className={`post-card animate-fadeInUp delay-${Math.min(i * 50, 300)} bg-white rounded-2xl border border-slate-100 overflow-hidden`}>
              {post.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.image} alt="Post" className="w-full h-52 object-cover" />
              )}
              <div className="p-5">
                {role === "club_admin" && (
                  <button onClick={() => handleDelete(post.id)} className="float-right text-slate-300 hover:text-red-500 transition-colors">✕</button>
                )}
                <p className="text-slate-700 text-sm leading-relaxed">{post.content}</p>

                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-50">
                  <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-pink-600 transition-colors font-medium">
                    <span>❤️</span> {post.like_count}
                  </button>
                  <button onClick={() => fetchComments(post.id)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                    <span>💬</span> Comments
                  </button>
                </div>

                {comments[post.id] && (
                  <div className="mt-3 space-y-2">
                    {comments[post.id].map(c => (
                      <div key={c.id} className="flex gap-2 text-xs">
                        <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0">{c.name[0]}</span>
                        <div className="bg-slate-50 rounded-lg px-3 py-1.5">
                          <span className="font-semibold text-slate-700">{c.name}: </span>
                          <span className="text-slate-600">{c.comment}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Add a comment… (Enter)"
                  className="mt-3 w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      handleComment(post.id, (e.target as HTMLInputElement).value)
                      ;(e.target as HTMLInputElement).value = ""
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
