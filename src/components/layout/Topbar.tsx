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

export default function Topbar() {
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
    <header className="h-14 border-b border-[#1e1e2e] flex items-center px-6 gap-4 bg-[#0a0a0f]/80 backdrop-blur-sm sticky top-0 z-40">
      <h1 className="font-semibold text-base text-[#e8e8f0] flex-1">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-[#4a4a6a]">{time}</span>
        <div className="w-8 h-8 rounded-full bg-[#6c47ff]/30 border border-[#6c47ff]/50 flex items-center justify-center text-xs font-bold text-[#a78bfa]">
          U
        </div>
      </div>
    </header>
  )
}