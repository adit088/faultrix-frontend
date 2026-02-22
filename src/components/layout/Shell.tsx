"use client"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

export interface SessionInfo {
  orgName: string
  slug: string
  plan: string
  maxRules: number
}

// Auth guard: validates session via server-side route (/api/auth/session).
// This hits our Next.js route which reads the HttpOnly cookie and verifies it
// against the backend — the API key never touches client-side JS.
// Non-sensitive org metadata (name, plan) comes back in the JSON response
// and is stored in React state (not localStorage).
export default function Shell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [session, setSession] = useState<SessionInfo | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let cancelled = false

    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session")
        if (!res.ok) throw new Error("No session")
        const data = await res.json()

        if (cancelled) return

        if (data.authenticated) {
          setSession({
            orgName: data.orgName,
            slug: data.slug,
            plan: data.plan,
            maxRules: data.maxRules,
          })
          setAuthed(true)
        } else {
          router.replace("/login")
        }
      } catch {
        if (!cancelled) {
          router.replace("/login")
        }
      }
    }

    checkSession()
    return () => { cancelled = true }
  }, [pathname, router])

  if (!authed || !session) {
    // Show nothing while session check is in flight — avoids flash of dashboard content
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]" style={{ minHeight: '100dvh' }}>
      <div className="orb orb-purple" />
      <div className="orb orb-blue" />
      <div className="grid-bg fixed inset-0 pointer-events-none z-0" />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-56 relative z-10 flex flex-col" style={{ minHeight: '100dvh' }}>
        <Topbar
          onMenuClick={() => setSidebarOpen(o => !o)}
          session={session}
        />
        <main className="flex-1 p-4 lg:p-6 pb-6 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}