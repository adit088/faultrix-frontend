"use client"
import { useState } from "react"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

export default function Shell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
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

      <div className="lg:ml-56 relative z-10 flex flex-col min-h-screen">
        <Topbar onMenuClick={() => setSidebarOpen(o => !o)} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}