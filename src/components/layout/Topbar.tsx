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
  "/proxy":       "HTTP Proxy",
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
  const [orgName, setOrgName] = useState("")

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrgName(localStorage.getItem("fx_org_name") ?? "")
    }
  }, [])

  // First letter of org name for avatar
  const initial = orgName ? orgName[0].toUpperCase() : "U"

  return (
    <header className="h-14 border-b border-[#1e1e2e] flex items-center px-3 lg:px-5 gap-3 bg-[#0a0a0f]/80 backdrop-blur-sm sticky top-0 z-40 flex-shrink-0">
      {/* Hamburger — 44px tap target */}
      <button
        onClick={onMenuClick}
        className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-lg text-[#8888aa] hover:text-[#e8e8f0] hover:bg-[#1e1e2e] transition-all active:scale-95 flex-shrink-0"
        aria-label="Open menu"
      >
        <span className="block w-5 h-0.5 bg-current rounded transition-all" />
        <span className="block w-5 h-0.5 bg-current rounded transition-all" />
        <span className="block w-4 h-0.5 bg-current rounded transition-all" />
      </button>

      <h1 className="font-semibold text-base text-[#e8e8f0] flex-1 truncate">{title}</h1>

      <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
        <span className="text-xs font-mono text-[#4a4a6a] hidden sm:block tabular-nums">{time}</span>
        {orgName && (
          <span className="text-xs text-[#4a4a6a] font-mono hidden md:block max-w-[120px] truncate">
            {orgName}
          </span>
        )}
        <div className="w-8 h-8 rounded-full bg-[#6c47ff]/30 border border-[#6c47ff]/50 flex items-center justify-center text-xs font-bold text-[#a78bfa] flex-shrink-0 select-none">
          {initial}
        </div>
      </div>
    </header>
  )
}