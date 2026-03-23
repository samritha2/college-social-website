"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Layout from "@/components/Layout"

interface UserInfo { id: number; name: string; email: string; role: string }
interface FollowedClub { club_id: number }

export default function ProfilePage() {
  const [user,     setUser]     = useState<UserInfo | null>(null)
  const [followed, setFollowed] = useState<FollowedClub[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return
    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      axios.get("http://localhost:5000/api/auth/me", { headers }),
      axios.get("http://localhost:5000/api/followers/my", { headers }),
    ]).then(([meRes, followedRes]) => {
      setUser(meRes.data)
      setFollowed(followedRes.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const roleLabel = (r: string) => r === "club_admin" ? "Club Admin 🏛️" : "Student 🎓"

  const stats = [
    { label: "Clubs Following", value: followed.length, icon: "🔔" },
    { label: "Account Type",    value: user ? roleLabel(user.role) : "—", icon: "🎭" },
    { label: "Member Since",    value: "2024",  icon: "📅" },
  ]

  return (
    <Layout>
      <div className="max-w-2xl animate-fadeInUp">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Your account information</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl p-6 animate-pulse border border-slate-100 h-20" />)}
          </div>
        ) : (
          <div className="space-y-5">
            {/* Avatar card */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
                {user?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2) ?? "?"}
              </div>
              <div>
                <h2 className="text-xl font-bold">{user?.name ?? "—"}</h2>
                <p className="text-indigo-200 text-sm">{user?.email ?? "—"}</p>
                <span className="mt-1 inline-block px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-medium">
                  {user ? roleLabel(user.role) : "—"}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((s, i) => (
                <div key={i} className={`animate-fadeInUp delay-${i * 50} bg-white rounded-2xl border border-slate-100 p-4 text-center`}>
                  <p className="text-2xl mb-1">{s.icon}</p>
                  <p className="font-bold text-slate-900 text-sm">{s.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Account info card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm">Account Details</h3>
              {[
                { label: "Full Name", value: user?.name },
                { label: "Email Address", value: user?.email },
                { label: "Role", value: user ? roleLabel(user.role) : "—" },
                { label: "User ID", value: `#${user?.id ?? "—"}` },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-500">{row.label}</span>
                  <span className="text-sm font-medium text-slate-800">{row.value ?? "—"}</span>
                </div>
              ))}
            </div>

            {/* Danger zone */}
            <div className="bg-white rounded-2xl border border-red-100 p-5">
              <h3 className="font-semibold text-slate-800 text-sm mb-3">Danger Zone</h3>
              <button
                onClick={() => { localStorage.removeItem("token"); window.location.href = "/" }}
                className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
