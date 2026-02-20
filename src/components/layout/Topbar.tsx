"use client"
import { usePathname } from "next/navigation"
import { useEffect, useState, useRef } from "react"

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
  const [plan, setPlan] = useState("Free")
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrgName(localStorage.getItem("fx_org_name") ?? "")
      const storedPlan = localStorage.getItem("fx_plan")
      if (storedPlan) setPlan(storedPlan.charAt(0).toUpperCase() + storedPlan.slice(1))
    }
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [menuOpen])

  const handleSignOut = () => {
    localStorage.clear()
    window.location.href = "/login"
  }

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

        {/* Avatar with dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="w-8 h-8 rounded-full bg-[#6c47ff]/30 border border-[#6c47ff]/50 flex items-center justify-center text-xs font-bold text-[#a78bfa] flex-shrink-0 hover:border-[#6c47ff] hover:bg-[#6c47ff]/40 transition-all cursor-pointer select-none"
            aria-label="User menu"
            aria-expanded={menuOpen}
          >
            {initial}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 bg-[#111118] border border-[#1e1e2e] rounded-xl shadow-2xl shadow-black/60 w-52 z-50 overflow-hidden animate-slide-up">
              {/* Org info */}
              <div className="px-4 py-3 border-b border-[#1e1e2e]">
                <p className="text-xs text-[#e8e8f0] font-medium truncate">{orgName || "Organization"}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-mono text-[#4a4a6a]">{plan} Plan</span>
                  {plan.toLowerCase() !== "pro" && (
                    <a
                      href="/pricing"
                      onClick={() => setMenuOpen(false)}
                      className="text-[10px] font-mono text-[#00e5a0] hover:underline"
                    >
                      → Upgrade
                    </a>
                  )}
                </div>
              </div>

              {/* Menu items */}
              <div className="p-1">
                <button
                  onClick={() => { setMenuOpen(false); window.location.href = "/pricing" }}
                  className="w-full text-left px-3 py-2.5 text-sm text-[#8888aa] hover:text-[#e8e8f0] hover:bg-[#1e1e2e] rounded-lg transition-colors flex items-center gap-2"
                >
                  <span className="text-base leading-none">✦</span>
                  <span>Upgrade Plan</span>
                </button>

                <div className="border-t border-[#1e1e2e] my-1" />

                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2.5 text-sm text-[#ff3b5c] hover:bg-[#ff3b5c]/10 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span className="text-base leading-none">⎋</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}