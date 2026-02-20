"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/dashboard",    label: "Dashboard",    icon: "◈" },
  { href: "/rules",        label: "Chaos Rules",  icon: "⚡" },
  { href: "/events",       label: "Live Events",  icon: "⚡" },
  { href: "/schedules",    label: "Schedules",    icon: "⏱" },
  { href: "/experiments",  label: "Experiments",  icon: "⚗" },
  { href: "/insights",     label: "AI Insights",  icon: "◎" },
  { href: "/webhooks",     label: "Webhooks",     icon: "⇆" },
  { href: "/pricing",      label: "Upgrade",      icon: "✦", accent: true },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const path = usePathname()
  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen w-56 flex flex-col z-50 border-r border-[#1e1e2e] bg-[#0d0d15]/95 backdrop-blur-xl transition-transform duration-300",
      "lg:translate-x-0",
      open ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="px-5 py-6 border-b border-[#1e1e2e] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6c47ff] flex items-center justify-center text-white font-bold text-sm">F</div>
            <span className="font-bold text-lg tracking-tight">Faultrix</span>
          </div>
          <p className="text-[10px] text-[#4a4a6a] mt-1 font-mono uppercase tracking-widest">Chaos Platform</p>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-[#4a4a6a] hover:text-[#e8e8f0] text-xl leading-none p-1"
        >
          ✕
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon, accent }) => {
          const active = path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
                active
                  ? "bg-[#6c47ff]/20 text-[#a78bfa] border border-[#6c47ff]/30"
                  : accent
                  ? "text-[#00e5a0] hover:bg-[#00e5a0]/10 border border-transparent"
                  : "text-[#8888aa] hover:text-[#e8e8f0] hover:bg-[#1e1e2e] border border-transparent"
              )}
            >
              <span className={cn("text-base transition-transform group-hover:scale-110", active && "text-[#6c47ff]")}>
                {icon}
              </span>
              <span className="font-medium">{label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#6c47ff]" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#1e1e2e]">
        <div className="bg-[#111118] rounded-lg p-3">
          <p className="text-[10px] font-mono text-[#4a4a6a] uppercase tracking-wider">API Status</p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="w-2 h-2 rounded-full bg-[#00e5a0] animate-pulse" />
            <span className="text-xs text-[#8888aa]">Connected</span>
          </div>
        </div>
      </div>
    </aside>
  )
}