"use client"
import { useState, useEffect } from "react"
import { experimentsApi } from "@/lib/api"
import { fmt, pct } from "@/lib/utils"
import type { TrafficStats } from "@/types"

const empty: TrafficStats = { total: 0, injected: 0, skipped: 0, injectionRate: 0 }

export default function ExperimentsPage() {
  const [traffic, setTraffic] = useState<TrafficStats>(empty)
  const [resetting, setResetting] = useState(false)
  const [loading, setLoading] = useState(true)

  async function loadTraffic() {
    try {
      const data = await experimentsApi.traffic()
      setTraffic(data)
    } catch {
      // backend may not have traffic endpoint yet — leave empty
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTraffic()
    const interval = setInterval(loadTraffic, 10000)
    return () => clearInterval(interval)
  }, [])

  const reset = async () => {
    setResetting(true)
    try {
      await experimentsApi.reset()
      setTraffic(empty)
    } catch {
      alert("Reset failed. Check backend connection.")
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="space-y-4 lg:space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#e8e8f0]">Experiments</h2>
          <p className="text-xs text-[#4a4a6a]">Traffic simulation and experiment control</p>
        </div>
        <button onClick={reset} disabled={resetting} className="px-3 py-2 lg:px-4 rounded-lg border border-[#ff3b5c]/50 text-[#ff3b5c] text-sm font-medium hover:bg-[#ff3b5c]/10 transition-colors disabled:opacity-50">
          {resetting ? "Resetting..." : "Reset"}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          { label: "Total Requests", value: loading ? "—" : fmt(traffic.total), color: "#6c47ff" },
          { label: "Injected", value: loading ? "—" : fmt(traffic.injected), color: "#ff3b5c" },
          { label: "Skipped", value: loading ? "—" : fmt(traffic.skipped), color: "#8888aa" },
          { label: "Injection Rate", value: loading ? "—" : pct(traffic.injectionRate), color: "#00e5a0" },
        ].map(s => (
          <div key={s.label} className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4 lg:p-5">
            <p className="text-[10px] font-mono uppercase text-[#4a4a6a]">{s.label}</p>
            <p className="text-2xl lg:text-3xl font-bold font-mono mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4 lg:p-5">
        <h3 className="text-sm font-semibold text-[#e8e8f0] mb-4">Traffic Breakdown</h3>
        <div className="h-6 rounded-full overflow-hidden flex bg-[#1e1e2e]">
          <div className="h-full bg-gradient-to-r from-[#ff3b5c] to-[#ff6b35] transition-all duration-700" style={{ width: `${traffic.injectionRate * 100}%` }} />
          <div className="h-full bg-[#2a2a3e] transition-all duration-700" style={{ width: `${(1 - traffic.injectionRate) * 100}%` }} />
        </div>
        <div className="flex justify-between text-xs text-[#4a4a6a] mt-2">
          <span className="text-[#ff3b5c]">Injected: {pct(traffic.injectionRate)}</span>
          <span>Skipped: {pct(1 - traffic.injectionRate)}</span>
        </div>
      </div>

      <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4 lg:p-5">
        <h3 className="text-sm font-semibold text-[#e8e8f0] mb-2">About Experiments</h3>
        <p className="text-xs text-[#8888aa] leading-relaxed">
          Experiments track how much chaos is being injected across your system in real time.
          Each request routed through a chaos rule is counted here. Use Reset to clear counters
          and start a fresh experiment run.
        </p>
      </div>
    </div>
  )
}