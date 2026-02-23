"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/dashboard",    label: "Dashboard",    icon: "⬡" },
  { href: "/rules",        label: "Chaos Rules",  icon: "◈" },
  { href: "/events",       label: "Live Events",  icon: "⚡" },
  { href: "/schedules",    label: "Schedules",    icon: "⏱" },
  { href: "/experiments",  label: "Experiments",  icon: "⚗" },
  { href: "/insights",     label: "AI Insights",  icon: "◎" },
  { href: "/proxy",        label: "HTTP Proxy",   icon: "⇢" },
  { href: "/webhooks",     label: "Webhooks",     icon: "⇆" },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const path = usePathname()
  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen w-64 flex flex-col z-50 border-r border-[#1e1e2e] bg-[#0d0d15]/98 backdrop-blur-xl transition-transform duration-300 ease-in-out",
      "lg:translate-x-0 lg:w-56",
      open ? "translate-x-0 shadow-2xl shadow-black/50" : "-translate-x-full"
    )}>
      {/* Header */}
      <div className="px-5 py-5 border-b border-[#1e1e2e] flex items-center justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div style={{ width: 32, height: 32, flexShrink: 0 }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <defs>
                  <linearGradient id="sbg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#6c47ff" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                  <linearGradient id="crack" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#6c47ff" />
                    <stop offset="100%" stopColor="#00e5a0" />
                  </linearGradient>
                  <filter id="sglow">
                    <feGaussianBlur stdDeviation="1.5" result="b" />
                    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
                <rect width="32" height="32" rx="8" fill="#111118" />
                <rect width="32" height="32" rx="8" fill="none" stroke="url(#sbg)" strokeWidth="0.8" opacity="0.6" />
                <polygon points="4,4 17,4 17,14 10,14 10,10 4,10" fill="url(#sbg)" opacity="0.9" />
                <polygon points="4,18 10,18 10,28 4,28" fill="url(#sbg)" opacity="0.7" />
                <polygon points="20,6 28,6 28,26 20,26 20,20 24,20 24,12 20,12" fill="url(#sbg)" opacity="0.85" />
                <line x1="4" y1="28" x2="28" y2="4" stroke="url(#crack)" strokeWidth="1.2" strokeLinecap="round" filter="url(#sglow)" />
                <circle cx="27" cy="5" r="2.5" fill="#00e5a0" opacity="0.9" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">Faultrix</span>
          </div>
          <p className="text-[10px] text-[#4a4a6a] mt-1 font-mono uppercase tracking-widest">Chaos Platform</p>
        </div>
        {/* Close button — large tap target for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-[#4a4a6a] hover:text-[#e8e8f0] hover:bg-[#1e1e2e] transition-all active:scale-95"
          aria-label="Close menu"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon }) => {
          const active = path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                // min-h-[44px] ensures 44px tap target on mobile (Apple HIG)
                "flex items-center gap-3 px-3 min-h-[44px] rounded-lg text-sm transition-all duration-200 group",
                active
                  ? "bg-[#6c47ff]/20 text-[#a78bfa] border border-[#6c47ff]/30"
                  : "text-[#8888aa] hover:text-[#e8e8f0] hover:bg-[#1e1e2e] border border-transparent active:bg-[#1e1e2e]"
              )}
            >
              <span className={cn("text-base transition-transform group-hover:scale-110 flex-shrink-0", active && "text-[#6c47ff]")}>
                {icon}
              </span>
              <span className="font-medium">{label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#6c47ff] flex-shrink-0" />}
            </Link>
          )
        })}
      </nav>

      {/* Upgrade CTA — prominent, full-width */}
      <div className="p-3 flex-shrink-0">
        <Link
          href="/pricing"
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 px-3 min-h-[48px] rounded-xl text-sm font-semibold transition-all duration-200 w-full",
            path.startsWith("/pricing")
              ? "bg-[#00e5a0]/20 text-[#00e5a0] border border-[#00e5a0]/40"
              : "bg-gradient-to-r from-[#6c47ff]/20 to-[#00e5a0]/10 text-[#00e5a0] border border-[#00e5a0]/30 hover:border-[#00e5a0]/60 hover:from-[#6c47ff]/30 hover:to-[#00e5a0]/20 active:scale-[0.98]"
          )}
        >
          <span className="text-base flex-shrink-0">✦</span>
          <span>Upgrade Plan</span>
          <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 bg-[#00e5a0]/15 rounded border border-[#00e5a0]/30 flex-shrink-0">
            PRO
          </span>
        </Link>
      </div>

      {/* Creator credit — above status so always visible on mobile */}
      <div className="px-3 pb-2 flex-shrink-0">
        <a
          href="https://x.com/Adit874319"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#6c47ff20] bg-gradient-to-r from-[#6c47ff0a] to-[#00e5a006] hover:border-[#6c47ff50] hover:from-[#6c47ff15] hover:to-[#00e5a010] transition-all duration-200 group w-full"
        >
          <svg className="w-3 h-3 text-[#6c47ff] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-mono text-[#3a3a5a] uppercase tracking-widest group-hover:text-[#5a5a7a] transition-colors leading-none mb-0.5">built by</span>
            <span className="text-[11px] font-mono font-bold text-[#7c6aff] group-hover:text-[#a78bfa] transition-colors leading-none truncate">@Adit874319</span>
          </div>
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00e5a0] opacity-70 group-hover:opacity-100 animate-pulse flex-shrink-0" />
        </a>
      </div>

      {/* Status */}
      <div className="px-4 pb-4 flex-shrink-0">
        <div className="bg-[#111118] rounded-lg p-3 border border-[#1e1e2e]">
          <p className="text-[10px] font-mono text-[#4a4a6a] uppercase tracking-wider">API Status</p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="w-2 h-2 rounded-full bg-[#00e5a0] animate-pulse flex-shrink-0" />
            <span className="text-xs text-[#8888aa]">Connected</span>
          </div>
        </div>
      </div>
    </aside>
  )
}