"use client"
import { useState } from "react"
import { mockRules } from "@/lib/mock"
import { pct, fmtMs, cn } from "@/lib/utils"
import type { ChaosRuleResponse } from "@/types"

const modeColors: Record<string, string> = {
  EXACT:  "bg-[#6c47ff]/20 text-[#a78bfa] border-[#6c47ff]/30",
  PREFIX: "bg-[#00e5a0]/10 text-[#00e5a0] border-[#00e5a0]/30",
  REGEX:  "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30",
}

export default function RulesPage() {
  const [rules, setRules] = useState<ChaosRuleResponse[]>(mockRules)
  const toggle = (id: number) => setRules(r => r.map(rule => rule.id === id ? { ...rule, enabled: !rule.enabled } : rule))
  const enabledCount = rules.filter(r => r.enabled).length

  return (
    <div className="space-y-4 lg:space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#e8e8f0]">Chaos Rules</h2>
          <p className="text-xs text-[#4a4a6a] mt-0.5">{enabledCount} active · {rules.length} total</p>
        </div>
        <button className="px-3 py-2 lg:px-4 rounded-lg bg-[#6c47ff] text-white text-sm font-medium hover:bg-[#7c57ff] transition-colors">
          + New Rule
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-[#111118] rounded-xl border border-[#1e1e2e] overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-[#1e1e2e] text-[10px] font-mono uppercase text-[#4a4a6a]">
          <div className="col-span-3">Target</div>
          <div className="col-span-2">Mode</div>
          <div className="col-span-2">Failure Rate</div>
          <div className="col-span-2">Max Delay</div>
          <div className="col-span-2">Blast Radius</div>
          <div className="col-span-1 text-right">Active</div>
        </div>
        {rules.map(rule => (
          <div key={rule.id} className={cn("grid grid-cols-12 gap-3 px-5 py-4 border-b border-[#1e1e2e]/50 items-center hover:bg-[#1a1a28]/50 transition-colors", !rule.enabled && "opacity-50")}>
            <div className="col-span-3">
              <p className="text-sm font-medium text-[#e8e8f0] truncate">{rule.target}</p>
              {rule.description && <p className="text-xs text-[#4a4a6a] truncate">{rule.description}</p>}
            </div>
            <div className="col-span-2">
              <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded border", modeColors[rule.targetingMode ?? "EXACT"])}>{rule.targetingMode ?? "EXACT"}</span>
            </div>
            <div className="col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-[#1e1e2e] rounded-full"><div className="h-full bg-[#ff3b5c] rounded-full" style={{ width: pct(rule.failureRate) }} /></div>
                <span className="text-xs font-mono text-[#e8e8f0] w-8">{pct(rule.failureRate)}</span>
              </div>
            </div>
            <div className="col-span-2"><span className="text-xs font-mono text-[#f59e0b]">{fmtMs(rule.maxDelayMs)}</span></div>
            <div className="col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-[#1e1e2e] rounded-full">
                  <div className="h-full rounded-full" style={{ width: pct(rule.blastRadius ?? 0), background: (rule.blastRadius ?? 0) > 0.7 ? "#ff3b5c" : (rule.blastRadius ?? 0) > 0.4 ? "#f59e0b" : "#00e5a0" }} />
                </div>
                <span className="text-xs font-mono text-[#8888aa] w-8">{pct(rule.blastRadius ?? 0)}</span>
              </div>
            </div>
            <div className="col-span-1 flex justify-end">
              <button onClick={() => toggle(rule.id)} className={cn("w-9 h-5 rounded-full transition-all duration-300 relative", rule.enabled ? "bg-[#00e5a0]/80" : "bg-[#2a2a3e]")}>
                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300", rule.enabled ? "translate-x-4" : "translate-x-0.5")} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {rules.map(rule => (
          <div key={rule.id} className={cn("bg-[#111118] rounded-xl border border-[#1e1e2e] p-4 space-y-3", !rule.enabled && "opacity-50")}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#e8e8f0] truncate">{rule.target}</p>
                {rule.description && <p className="text-xs text-[#4a4a6a] truncate mt-0.5">{rule.description}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded border", modeColors[rule.targetingMode ?? "EXACT"])}>{rule.targetingMode ?? "EXACT"}</span>
                <button onClick={() => toggle(rule.id)} className={cn("w-9 h-5 rounded-full transition-all duration-300 relative", rule.enabled ? "bg-[#00e5a0]/80" : "bg-[#2a2a3e]")}>
                  <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300", rule.enabled ? "translate-x-4" : "translate-x-0.5")} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-[10px] font-mono text-[#4a4a6a] uppercase mb-1">Failure Rate</p>
                <div className="h-1 bg-[#1e1e2e] rounded-full mb-1"><div className="h-full bg-[#ff3b5c] rounded-full" style={{ width: pct(rule.failureRate) }} /></div>
                <span className="font-mono text-[#e8e8f0]">{pct(rule.failureRate)}</span>
              </div>
              <div>
                <p className="text-[10px] font-mono text-[#4a4a6a] uppercase mb-1">Max Delay</p>
                <span className="font-mono text-[#f59e0b]">{fmtMs(rule.maxDelayMs)}</span>
              </div>
              <div>
                <p className="text-[10px] font-mono text-[#4a4a6a] uppercase mb-1">Blast Radius</p>
                <div className="h-1 bg-[#1e1e2e] rounded-full mb-1">
                  <div className="h-full rounded-full" style={{ width: pct(rule.blastRadius ?? 0), background: (rule.blastRadius ?? 0) > 0.7 ? "#ff3b5c" : (rule.blastRadius ?? 0) > 0.4 ? "#f59e0b" : "#00e5a0" }} />
                </div>
                <span className="font-mono text-[#8888aa]">{pct(rule.blastRadius ?? 0)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}