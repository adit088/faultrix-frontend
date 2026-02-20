"use client"
import { useState, useEffect } from "react"
import { eventsApi } from "@/lib/api"
import { fmt, pct } from "@/lib/utils"
import EventFeed from "@/components/events/EventFeed"
import type { ChaosAnalyticsResponse } from "@/types"

export default function EventsPage() {
  const [analytics, setAnalytics] = useState<ChaosAnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    eventsApi.analytics("24h")
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setLoading(false))

    const interval = setInterval(() => {
      eventsApi.analytics("24h").then(setAnalytics).catch(console.error)
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-4 lg:space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#e8e8f0]">Live Events</h2>
          <p className="text-xs text-[#4a4a6a] mt-0.5">Real-time chaos injection stream</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00e5a0] animate-pulse" />
          <span className="text-xs text-[#00e5a0] font-mono">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 lg:gap-4">
        {[
          { label: "Total Events", value: loading ? "—" : fmt(analytics?.totalEvents ?? 0), color: "#6c47ff" },
          { label: "Injected", value: loading ? "—" : fmt(analytics?.injectedCount ?? 0), color: "#ff3b5c" },
          { label: "Injection Rate", value: loading ? "—" : pct(analytics?.injectionRate ?? 0), color: "#00e5a0" },
        ].map(s => (
          <div key={s.label} className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-3 lg:p-4 text-center">
            <p className="text-[10px] font-mono uppercase text-[#4a4a6a]">{s.label}</p>
            <p className="text-xl lg:text-2xl font-bold font-mono mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4 lg:p-5">
        <EventFeed limit={20} />
      </div>
    </div>
  )
}