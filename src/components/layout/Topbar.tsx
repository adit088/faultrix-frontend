"use client"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

const titles: Record<string, string> = {
  "/dashboard":   "Dashboard",
  "/rules":       "Chaos Rules",
  "/events":      "Live Events",
  "/schedules":   "Schedules",
  "/experiments": "Experiments",
  "/insights":    "AI Insights",
  "/webhooks":    "Webhooks",
  "/pricing":     "Upgrade Plan",
}

interface TopbarProps {
  onMenuClick: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const path = usePathname()
  const title = Object.entries(titles).find(([k]) => path.startsWith(k))?.[1] ?? "Faultrix"
  const [time, setTime] = useState("")

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="h-14 border-b border-[#1e1e2e] flex items-center px-4 gap-3 bg-[#0a0a0f]/80 backdrop-blur-sm sticky top-0 z-40">
      <button
        onClick={onMenuClick}
        className="lg:hidden flex flex-col gap-1.5 p-1 text-[#8888aa] hover:text-[#e8e8f0] transition-colors"
        aria-label="Open menu"
      >
        <span className="block w-5 h-0.5 bg-current rounded" />
        <span className="block w-5 h-0.5 bg-current rounded" />
        <span className="block w-5 h-0.5 bg-current rounded" />
      </button>

      <h1 className="font-semibold text-base text-[#e8e8f0] flex-1">{title}</h1>

      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-[#4a4a6a] hidden sm:block">{time}</span>
        <div className="w-8 h-8 rounded-full bg-[#6c47ff]/30 border border-[#6c47ff]/50 flex items-center justify-center text-xs font-bold text-[#a78bfa]">
          U
        </div>
      </div>
    </header>
  )
}