"use client"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { controlApi } from "@/lib/api"
import { mockKillSwitch } from "@/lib/mock"
import type { KillSwitchStatus } from "@/types"

export default function KillSwitch() {
  const [status, setStatus] = useState<KillSwitchStatus>(mockKillSwitch)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    try {
      const res = await controlApi.toggle()
      setStatus(res)
    } catch {
      setStatus(s => ({ ...s, enabled: !s.enabled }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn(
      "relative rounded-2xl border p-6 transition-all duration-500 overflow-hidden",
      status.enabled
        ? "bg-[#ff3b5c]/8 border-[#ff3b5c]/40 ks-active"
        : "bg-[#00e5a0]/5 border-[#00e5a0]/25 ks-safe"
    )}>
      {/* Animated bg pulse */}
      <div className={cn(
        "absolute inset-0 rounded-2xl opacity-20 transition-all duration-500",
        status.enabled
          ? "bg-gradient-to-br from-[#ff3b5c]/20 to-transparent animate-pulse-slow"
          : "bg-gradient-to-br from-[#00e5a0]/10 to-transparent"
      )} />

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-[#4a4a6a] mb-1">Kill Switch</p>
          <h2 className={cn(
            "text-2xl font-bold transition-colors",
            status.enabled ? "text-[#ff3b5c]" : "text-[#00e5a0]"
          )}>
            {status.enabled ? "CHAOS ACTIVE" : "SYSTEM SAFE"}
          </h2>
          <p className="text-xs text-[#8888aa] mt-1">
            {status.enabled ? "All enabled rules are injecting failures" : "Chaos injection globally disabled"}
          </p>
        </div>

        <button
          onClick={toggle}
          disabled={loading}
          className={cn(
            "relative w-20 h-20 rounded-full border-2 font-bold text-sm tracking-wider transition-all duration-300",
            "flex items-center justify-center flex-col gap-0.5",
            status.enabled
              ? "bg-[#ff3b5c]/20 border-[#ff3b5c] text-[#ff3b5c] hover:bg-[#ff3b5c]/30"
              : "bg-[#00e5a0]/15 border-[#00e5a0] text-[#00e5a0] hover:bg-[#00e5a0]/25",
            loading && "opacity-60 cursor-not-allowed scale-95"
          )}
        >
          <span className="text-2xl">{status.enabled ? "⚡" : "◎"}</span>
          <span className="text-[9px] font-mono">{loading ? "..." : status.enabled ? "STOP" : "ARM"}</span>
        </button>
      </div>
    </div>
  )
}
