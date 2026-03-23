"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import Layout from "@/components/Layout"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: number
  type: string
  message: string
  link: string
  is_read: boolean
  created_at: string
}

const TYPE_ICON: Record<string, string> = {
  new_post: "📢", like: "❤️", comment: "💬", default: "🔔"
}

export default function NotificationsPage() {
  const [notifs,  setNotifs]  = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const token   = () => localStorage.getItem("token")
  const auth    = () => ({ headers: { Authorization: `Bearer ${token()}` } })

  useEffect(() => {
    axios.get("http://localhost:5000/api/notifications", auth())
      .then(r => setNotifs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const markAllRead = async () => {
    await axios.post("http://localhost:5000/api/notifications/read-all", {}, auth()).catch(() => {})
    setNotifs(n => n.map(x => ({ ...x, is_read: true })))
  }

  const unread = notifs.filter(n => !n.is_read).length

  return (
    <Layout>
      <div className="max-w-2xl animate-fadeInUp">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="text-slate-500 text-sm mt-1">
              {unread > 0 ? `${unread} unread` : "All caught up!"}
            </p>
          </div>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : notifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl mb-4">🔔</div>
            <p className="text-slate-700 font-semibold">No notifications yet</p>
            <p className="text-slate-400 text-sm mt-1">Follow clubs to get notified about new posts.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifs.map((n, i) => (
              <button
                key={n.id}
                onClick={() => n.link && router.push(n.link)}
                className={`w-full text-left animate-fadeInUp delay-${Math.min(i * 50, 300)} flex items-start gap-4 p-4 rounded-2xl border transition-all duration-150 hover:shadow-md ${
                  n.is_read
                    ? "bg-white border-slate-100"
                    : "bg-indigo-50/60 border-indigo-100"
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${n.is_read ? "bg-slate-100" : "bg-white shadow-sm"}`}>
                  {TYPE_ICON[n.type] ?? TYPE_ICON.default}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${n.is_read ? "text-slate-600" : "text-slate-900 font-medium"}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>

                {/* Unread dot */}
                {!n.is_read && (
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
