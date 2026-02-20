"use client"
import { useState, useEffect } from "react"
import { rulesApi } from "@/lib/api"
import { pct, fmtMs, cn } from "@/lib/utils"
import type { ChaosRuleResponse, ChaosRuleRequest } from "@/types"

const modeColors: Record<string, string> = {
  EXACT:  "bg-[#6c47ff]/20 text-[#a78bfa] border-[#6c47ff]/30",
  PREFIX: "bg-[#00e5a0]/10 text-[#00e5a0] border-[#00e5a0]/30",
  REGEX:  "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30",
}

const defaultForm: ChaosRuleRequest = {
  target: "",
  targetingMode: "EXACT",
  failureRate: 0.1,
  maxDelayMs: 500,
  enabled: true,
  description: "",
  blastRadius: 0.2,
}

export default function RulesPage() {
  const [rules, setRules] = useState<ChaosRuleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<ChaosRuleRequest>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  async function load() {
    try {
      const data = await rulesApi.list()
      setRules(data)
      setError(null)
    } catch {
      setError("Failed to load rules")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const toggle = async (rule: ChaosRuleResponse) => {
    setTogglingId(rule.id)
    try {
      // Optimistic update
      setRules(r => r.map(x => x.id === rule.id ? { ...x, enabled: !x.enabled } : x))
      await rulesApi.update(rule.id, {
        target: rule.target,
        targetingMode: rule.targetingMode,
        failureRate: rule.failureRate,
        maxDelayMs: rule.maxDelayMs,
        enabled: !rule.enabled,
        description: rule.description,
        blastRadius: rule.blastRadius,
      })
    } catch {
      // Revert on failure
      setRules(r => r.map(x => x.id === rule.id ? { ...x, enabled: rule.enabled } : x))
    } finally {
      setTogglingId(null)
    }
  }

  const deleteRule = async (id: number) => {
    if (!confirm("Delete this rule?")) return
    try {
      setRules(r => r.filter(x => x.id !== id))
      await rulesApi.delete(id)
    } catch {
      load() // Reload if delete fails
    }
  }

  const createRule = async () => {
    if (!form.target.trim()) return
    setSaving(true)
    try {
      const created = await rulesApi.create(form)
      setRules(r => [...r, created])
      setShowForm(false)
      setForm(defaultForm)
    } catch {
      alert("Failed to create rule. Check backend connection.")
    } finally {
      setSaving(false)
    }
  }

  const enabledCount = rules.filter(r => r.enabled).length

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-[#6c47ff] border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="space-y-4 lg:space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#e8e8f0]">Chaos Rules</h2>
          <p className="text-xs text-[#4a4a6a] mt-0.5">{enabledCount} active · {rules.length} total</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-3 py-2 lg:px-4 rounded-lg bg-[#6c47ff] text-white text-sm font-medium hover:bg-[#7c57ff] transition-colors">
          + New Rule
        </button>
      </div>

      {error && (
        <div className="bg-[#ff3b5c]/10 border border-[#ff3b5c]/30 rounded-xl p-4 text-sm text-[#ff3b5c]">
          {error} — <button onClick={load} className="underline">Retry</button>
        </div>
      )}

      {/* New Rule Form */}
      {showForm && (
        <div className="bg-[#111118] rounded-xl border border-[#6c47ff]/40 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-[#e8e8f0]">New Chaos Rule</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase text-[#4a4a6a] block mb-1">Target *</label>
              <input
                value={form.target}
                onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                placeholder="e.g. payment-service"
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] focus:border-[#6c47ff] outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-[#4a4a6a] block mb-1">Targeting Mode</label>
              <select
                value={form.targetingMode}
                onChange={e => setForm(f => ({ ...f, targetingMode: e.target.value as "EXACT" | "PREFIX" | "REGEX" }))}
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] focus:border-[#6c47ff] outline-none"
              >
                <option value="EXACT">EXACT</option>
                <option value="PREFIX">PREFIX</option>
                <option value="REGEX">REGEX</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-[#4a4a6a] block mb-1">Failure Rate ({Math.round((form.failureRate ?? 0) * 100)}%)</label>
              <input
                type="range" min="0" max="1" step="0.05"
                value={form.failureRate}
                onChange={e => setForm(f => ({ ...f, failureRate: parseFloat(e.target.value) }))}
                className="w-full accent-[#ff3b5c]"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-[#4a4a6a] block mb-1">Max Delay (ms)</label>
              <input
                type="number" min="0" max="30000"
                value={form.maxDelayMs}
                onChange={e => setForm(f => ({ ...f, maxDelayMs: parseInt(e.target.value) }))}
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] focus:border-[#6c47ff] outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-[#4a4a6a] block mb-1">Blast Radius ({Math.round((form.blastRadius ?? 0) * 100)}%)</label>
              <input
                type="range" min="0" max="1" step="0.05"
                value={form.blastRadius}
                onChange={e => setForm(f => ({ ...f, blastRadius: parseFloat(e.target.value) }))}
                className="w-full accent-[#6c47ff]"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-[#4a4a6a] block mb-1">Description</label>
              <input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional description"
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] focus:border-[#6c47ff] outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={createRule} disabled={saving || !form.target.trim()} className="px-4 py-2 rounded-lg bg-[#6c47ff] text-white text-sm font-medium hover:bg-[#7c57ff] disabled:opacity-50">
              {saving ? "Creating..." : "Create Rule"}
            </button>
            <button onClick={() => { setShowForm(false); setForm(defaultForm) }} className="px-4 py-2 rounded-lg border border-[#1e1e2e] text-[#8888aa] text-sm hover:text-[#e8e8f0]">
              Cancel
            </button>
          </div>
        </div>
      )}

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
        {rules.length === 0 && (
          <div className="px-5 py-12 text-center text-xs text-[#4a4a6a] font-mono">
            No rules yet. Create your first chaos rule above.
          </div>
        )}
        {rules.map(rule => (
          <div key={rule.id} className={cn("grid grid-cols-12 gap-3 px-5 py-4 border-b border-[#1e1e2e]/50 items-center hover:bg-[#1a1a28]/50 transition-colors group", !rule.enabled && "opacity-50")}>
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
            <div className="col-span-1 flex justify-end items-center gap-2">
              <button
                onClick={() => deleteRule(rule.id)}
                className="opacity-0 group-hover:opacity-100 text-[#ff3b5c]/60 hover:text-[#ff3b5c] text-xs transition-all"
                title="Delete"
              >✕</button>
              <button
                onClick={() => toggle(rule)}
                disabled={togglingId === rule.id}
                className={cn("w-9 h-5 rounded-full transition-all duration-300 relative disabled:opacity-50", rule.enabled ? "bg-[#00e5a0]/80" : "bg-[#2a2a3e]")}
              >
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
                <button onClick={() => toggle(rule)} disabled={togglingId === rule.id} className={cn("w-9 h-5 rounded-full transition-all duration-300 relative", rule.enabled ? "bg-[#00e5a0]/80" : "bg-[#2a2a3e]")}>
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
                <span className="font-mono text-[#8888aa]">{pct(rule.blastRadius ?? 0)}</span>
              </div>
            </div>
            <button onClick={() => deleteRule(rule.id)} className="text-xs text-[#ff3b5c]/60 hover:text-[#ff3b5c]">Delete rule</button>
          </div>
        ))}
      </div>
    </div>
  )
}