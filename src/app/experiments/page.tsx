"use client"
import { useState } from "react"
import { mockTraffic } from "@/lib/mock"
import { fmt, pct } from "@/lib/utils"

export default function ExperimentsPage() {
  const [traffic, setTraffic] = useState(mockTraffic)
  const [resetting, setResetting] = useState(false)

  const reset = async () => {
    setResetting(true)
    setTimeout(() => {
      setTraffic({ total: 0, injected: 0, skipped: 0, injectionRate: 0 })
      setResetting(false)
    }, 800)
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#e8e8f0]">Experiments</h2>
          <p className="text-xs text-[#4a4a6a]">Traffic simulation and experiment control</p>
        </div>
        <button
          onClick={reset}
          disabled={resetting}
          className="px-4 py-2 rounded-lg border border-[#ff3b5c]/50 text-[#ff3b5c] text-sm font-medium hover:bg-[#ff3b5c]/10 transition-colors disabled:opacity-50"
        >
          {resetting ? "Resetting..." : "Reset Counters"}
        </button>
      </div>

      {/* Traffic cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: fmt(traffic.total), color: "#6c47ff" },
          { label: "Injected", value: fmt(traffic.injected), color: "#ff3b5c" },
          { label: "Skipped", value: fmt(traffic.skipped), color: "#8888aa" },
          { label: "Injection Rate", value: pct(traffic.injectionRate), color: "#00e5a0" },
        ].map(s => (
          <div key={s.label} className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-5">
            <p className="text-[10px] font-mono uppercase text-[#4a4a6a]">{s.label}</p>
            <p className="text-3xl font-bold font-mono mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Traffic breakdown bar */}
      <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-5">
        <h3 className="text-sm font-semibold text-[#e8e8f0] mb-4">Traffic Breakdown</h3>
        <div className="h-6 rounded-full overflow-hidden flex bg-[#1e1e2e]">
          <div
            className="h-full bg-gradient-to-r from-[#ff3b5c] to-[#ff6b35] transition-all duration-700"
            style={{ width: `${traffic.injectionRate * 100}%` }}
          />
          <div
            className="h-full bg-[#2a2a3e] transition-all duration-700"
            style={{ width: `${(1 - traffic.injectionRate) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-[#4a4a6a] mt-2">
          <span className="text-[#ff3b5c]">Injected: {pct(traffic.injectionRate)}</span>
          <span>Skipped: {pct(1 - traffic.injectionRate)}</span>
        </div>
      </div>
    </div>
  )
}
