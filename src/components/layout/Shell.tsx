"use client"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

// BUG FIX: Shell had NO auth guard. Any URL inside the dashboard was accessible
// without a logged-in session. This adds a client-side guard that redirects
// unauthenticated users to /login. The backend protects the actual data via
// X-API-Key auth — this guard just prevents the UI flash of empty/broken state.
export default function Shell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authed, setAuthed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const key = localStorage.getItem("fx_api_key")
    if (!key) {
      router.replace("/login")
    } else {
      setAuthed(true)
    }
  }, [pathname, router])

  if (!authed) {
    // Show nothing while redirect is in flight — avoids flash of dashboard content
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]" style={{ minHeight: '100dvh' }}>
      <div className="orb orb-purple" />
      <div className="orb orb-blue" />
      <div className="grid-bg fixed inset-0 pointer-events-none z-0" />

      {/* Overlay — covers full screen including safe areas */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-56 relative z-10 flex flex-col" style={{ minHeight: '100dvh' }}>
        <Topbar onMenuClick={() => setSidebarOpen(o => !o)} />
        {/* pb-safe adds padding for iPhone home bar */}
        <main className="flex-1 p-4 lg:p-6 pb-6 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}