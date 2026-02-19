"use client"
import EventFeed from "@/components/events/EventFeed"
import { mockAnalytics } from "@/lib/mock"
import { fmt, pct } from "@/lib/utils"

export default function EventsPage() {
  return (
    <div className="space-y-6 animate-slide-up">
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

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Events", value: fmt(mockAnalytics.totalEvents), color: "#6c47ff" },
          { label: "Injected", value: fmt(mockAnalytics.injectedCount), color: "#ff3b5c" },
          { label: "Injection Rate", value: pct(mockAnalytics.injectionRate), color: "#00e5a0" },
        ].map(s => (
          <div key={s.label} className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4 text-center">
            <p className="text-[10px] font-mono uppercase text-[#4a4a6a]">{s.label}</p>
            <p className="text-2xl font-bold font-mono mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Full event feed */}
      <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-5">
        <EventFeed limit={20} />
      </div>
    </div>
  )
}
