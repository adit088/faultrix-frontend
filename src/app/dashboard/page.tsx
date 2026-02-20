"use client"
import { mockAnalytics, mockRules } from "@/lib/mock"
import { pct, fmt, fmtMs } from "@/lib/utils"
import KillSwitch from "@/components/chaos/KillSwitch"
import InjectionChart from "@/components/charts/InjectionChart"
import BlastRadiusDial from "@/components/charts/BlastRadiusDial"
import EventFeed from "@/components/events/EventFeed"

const stats = [
  { label: "Total Events", value: fmt(mockAnalytics.totalEvents), sub: "Last 24h", color: "#6c47ff" },
  { label: "Injected", value: fmt(mockAnalytics.injectedCount), sub: pct(mockAnalytics.injectionRate) + " rate", color: "#ff3b5c" },
  { label: "Avg Latency", value: fmtMs(mockAnalytics.avgInjectedLatencyMs ?? 0), sub: "When injected", color: "#f59e0b" },
  { label: "Active Rules", value: String(mockRules.filter(r => r.enabled).length), sub: `of ${mockRules.length} total`, color: "#00e5a0" },
]

export default function Dashboard() {
  const avgBlast = mockRules.filter(r => r.enabled).reduce((a, r) => a + (r.blastRadius ?? 0), 0) / mockRules.filter(r => r.enabled).length

  return (
    <div className="space-y-4 lg:space-y-6 animate-slide-up">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map(s => (
          <div key={s.label} className="stat-card relative bg-[#111118] rounded-xl border border-[#1e1e2e] p-4 lg:p-5">
            <p className="text-[11px] font-mono uppercase tracking-widest text-[#4a4a6a]">{s.label}</p>
            <p className="text-2xl lg:text-3xl font-bold mt-1 font-mono" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-[#8888aa] mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#111118] rounded-xl border border-[#1e1e2e] p-4 lg:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#e8e8f0]">Injection Timeline</h3>
              <p className="text-xs text-[#4a4a6a]">{mockAnalytics.windowLabel}</p>
            </div>
            <div className="flex gap-3 text-xs text-[#8888aa]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#6c47ff] inline-block"/>Injected</span>
            </div>
          </div>
          <InjectionChart analytics={mockAnalytics} />
        </div>

        <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4 lg:p-5 flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-[#e8e8f0] mb-4">Blast Radius</h3>
          <BlastRadiusDial value={isNaN(avgBlast) ? 0.4 : avgBlast} />
          <p className="text-xs text-[#4a4a6a] mt-4 text-center">Average across active rules</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <KillSwitch />
        </div>
        <div className="lg:col-span-2 bg-[#111118] rounded-xl border border-[#1e1e2e] p-4 lg:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#e8e8f0]">Live Events</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00e5a0] animate-pulse" />
              <span className="text-xs text-[#4a4a6a]">Streaming</span>
            </div>
          </div>
          <EventFeed limit={6} />
        </div>
      </div>

      <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4 lg:p-5">
        <h3 className="text-sm font-semibold text-[#e8e8f0] mb-4">Top Targets by Injection Count</h3>
        <div className="space-y-3">
          {mockAnalytics.topTargets.map((t, i) => {
            const max = mockAnalytics.topTargets[0].injectionCount
            const pctVal = (t.injectionCount / max) * 100
            return (
              <div key={t.target} className="flex items-center gap-2 lg:gap-3">
                <span className="text-[11px] font-mono text-[#4a4a6a] w-4">{i + 1}</span>
                <span className="text-sm text-[#e8e8f0] w-28 lg:w-40 truncate">{t.target}</span>
                <div className="flex-1 h-1.5 bg-[#1e1e2e] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#6c47ff] to-[#a78bfa]" style={{ width: `${pctVal}%` }} />
                </div>
                <span className="text-xs font-mono text-[#8888aa] w-10 lg:w-12 text-right">{fmt(t.injectionCount)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}