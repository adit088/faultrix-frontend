"use client"
import { useState, useEffect, useCallback } from "react"
import { insightsApi, rulesApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { FailureInsight, ChaosRuleResponse, InsightLevel } from "@/types"

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVEL_CONFIG: Record<InsightLevel, {
  border: string; badge: string; text: string; glow: string; bg: string; icon: string
}> = {
  CRITICAL: {
    border: "border-[#ff3b5c]/40",
    badge:  "bg-[#ff3b5c]/15 text-[#ff3b5c] border-[#ff3b5c]/30",
    text:   "text-[#ff3b5c]",
    glow:   "#ff3b5c",
    bg:     "bg-[#ff3b5c]/5",
    icon:   "⬟",
  },
  WARNING: {
    border: "border-[#f59e0b]/40",
    badge:  "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30",
    text:   "text-[#f59e0b]",
    glow:   "#f59e0b",
    bg:     "bg-[#f59e0b]/5",
    icon:   "▲",
  },
  INFO: {
    border: "border-[#6c47ff]/40",
    badge:  "bg-[#6c47ff]/15 text-[#a78bfa] border-[#6c47ff]/30",
    text:   "text-[#a78bfa]",
    glow:   "#6c47ff",
    bg:     "bg-[#6c47ff]/5",
    icon:   "◈",
  },
  SUCCESS: {
    border: "border-[#00e5a0]/40",
    badge:  "bg-[#00e5a0]/15 text-[#00e5a0] border-[#00e5a0]/30",
    text:   "text-[#00e5a0]",
    glow:   "#00e5a0",
    bg:     "bg-[#00e5a0]/5",
    icon:   "✓",
  },
}

const TREND_CONFIG: Record<string, { text: string; label: string }> = {
  WORSENING: { text: "text-[#ff3b5c]", label: "↑ Worsening" },
  STABLE:    { text: "text-[#f59e0b]", label: "→ Stable" },
  IMPROVING: { text: "text-[#00e5a0]", label: "↓ Improving" },
  NEW:       { text: "text-[#a78bfa]", label: "◆ New" },
}

const TYPE_LABELS: Record<string, string> = {
  CASCADING_FAILURE:        "Causal Impact Analysis",
  FAILURE_OVERRUN:          "Failure Rate Monitor",
  CIRCUIT_BREAKER_MISSING:  "Circuit Breaker Detector",
  RETRY_STORM:              "Retry Pattern Analyzer",
  LATENCY_AMPLIFICATION:    "Time-Series Anomaly Detection",
  TIMEOUT_MISSING:          "Timeout Coverage Scan",
  SLOW_RECOVERY:            "Recovery Time Analyzer",
  LOW_SAMPLE_BIAS:          "Statistical Confidence Engine",
  PEAK_HOUR_FRAGILITY:      "Traffic Pattern Detector",
  BLAST_RADIUS_MISMATCH:    "Blast Radius Validator",
  RESOURCE_EXHAUSTION:      "Resource Monitor",
  QUEUE_BUILDUP:            "Queue Depth Analyzer",
  RATE_LIMIT_HIT:           "Rate Limit Tracker",
  MISSING_FALLBACK:         "Fallback Coverage Scan",
  CACHE_POISONING:          "Cache Integrity Check",
  DEPENDENCY_HELL:          "Dependency Graph Analyzer",
  RESILIENT_SYSTEM:         "Resilience Scorer",
  OPTIMAL_RECOVERY:         "Recovery Benchmark",
  GOOD_ISOLATION:           "Blast Radius Validator",
}

// ─── InsightCard ──────────────────────────────────────────────────────────────

function InsightCard({ ins }: { ins: FailureInsight }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = LEVEL_CONFIG[ins.level]
  const algorithmLabel = TYPE_LABELS[ins.type] ?? ins.type

  return (
    <div className={cn(
      "bg-[#111118] rounded-xl border p-4 lg:p-5 space-y-3 transition-all duration-200",
      cfg.border,
      expanded && cfg.bg
    )}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1", cfg.badge)}>
              <span>{cfg.icon}</span> {ins.level}
            </span>
            <span className="text-[10px] text-[#4a4a6a] font-mono">{algorithmLabel}</span>
            {ins.trend && TREND_CONFIG[ins.trend] && (
              <span className={cn("text-[10px] font-mono", TREND_CONFIG[ins.trend].text)}>
                {TREND_CONFIG[ins.trend].label}
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-[#e8e8f0] leading-snug">{ins.title}</h3>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-[#4a4a6a]">Confidence</p>
          <p className={cn("text-lg font-bold font-mono", cfg.text)}>
            {ins.confidenceScore != null ? `${Math.round(ins.confidenceScore * 100)}%` : "—"}
          </p>
        </div>
      </div>

      {/* Confidence bar */}
      {ins.confidenceScore != null && (
        <div className="h-1 bg-[#1e1e2e] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${ins.confidenceScore * 100}%`, background: cfg.glow }}
          />
        </div>
      )}

      {/* Message */}
      <p className="text-xs text-[#8888aa] leading-relaxed">{ins.message}</p>

      {/* Metrics row */}
      {(ins.affectedRequests != null || ins.estimatedImpact || ins.avgRecoveryTimeMs != null || ins.priorityScore != null) && (
        <div className="flex flex-wrap gap-2">
          {ins.affectedRequests != null && (
            <div className="bg-[#0a0a0f] rounded-lg px-3 py-1.5 border border-[#1e1e2e]">
              <p className="text-[9px] font-mono text-[#4a4a6a] uppercase tracking-wider">Affected Reqs</p>
              <p className="text-sm font-bold font-mono text-[#e8e8f0]">{ins.affectedRequests.toLocaleString()}</p>
            </div>
          )}
          {ins.avgRecoveryTimeMs != null && (
            <div className="bg-[#0a0a0f] rounded-lg px-3 py-1.5 border border-[#1e1e2e]">
              <p className="text-[9px] font-mono text-[#4a4a6a] uppercase tracking-wider">Avg Recovery</p>
              <p className="text-sm font-bold font-mono text-[#e8e8f0]">{ins.avgRecoveryTimeMs}ms</p>
            </div>
          )}
          {ins.estimatedImpact && (
            <div className="bg-[#0a0a0f] rounded-lg px-3 py-1.5 border border-[#1e1e2e]">
              <p className="text-[9px] font-mono text-[#4a4a6a] uppercase tracking-wider">Impact</p>
              <p className={cn("text-xs font-mono font-semibold", cfg.text)}>{ins.estimatedImpact}</p>
            </div>
          )}
          {ins.estimatedCost && (
            <div className="bg-[#0a0a0f] rounded-lg px-3 py-1.5 border border-[#1e1e2e]">
              <p className="text-[9px] font-mono text-[#4a4a6a] uppercase tracking-wider">Est. Cost</p>
              <p className="text-xs font-mono font-semibold text-[#f59e0b]">{ins.estimatedCost}</p>
            </div>
          )}
          {ins.priorityScore != null && (
            <div className="bg-[#0a0a0f] rounded-lg px-3 py-1.5 border border-[#1e1e2e]">
              <p className="text-[9px] font-mono text-[#4a4a6a] uppercase tracking-wider">Priority</p>
              <p className={cn("text-sm font-bold font-mono",
                ins.priorityScore >= 80 ? "text-[#ff3b5c]"
                : ins.priorityScore >= 50 ? "text-[#f59e0b]"
                : "text-[#a78bfa]"
              )}>
                {ins.priorityScore}/100
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recommendation */}
      <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#1e1e2e]">
        <p className="text-[9px] font-mono text-[#4a4a6a] uppercase tracking-wider mb-1.5">Recommendation</p>
        <p className="text-xs text-[#8888aa] leading-relaxed">{ins.recommendation}</p>
      </div>

      {/* Failure rate comparison */}
      {ins.observedFailureRate != null && ins.expectedFailureRate != null && (
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[9px] font-mono text-[#4a4a6a] uppercase tracking-wider">Expected</p>
            <p className="text-xs font-mono text-[#8888aa]">{(ins.expectedFailureRate * 100).toFixed(1)}%</p>
          </div>
          <span className="text-[#4a4a6a] font-mono text-xs">→</span>
          <div>
            <p className="text-[9px] font-mono text-[#4a4a6a] uppercase tracking-wider">Observed</p>
            <p className={cn("text-xs font-mono font-bold", cfg.text)}>{(ins.observedFailureRate * 100).toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Expandable suggested fixes */}
      {ins.suggestedFixes && ins.suggestedFixes.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-[10px] font-mono text-[#4a4a6a] hover:text-[#a78bfa] transition-colors flex items-center gap-1"
          >
            {expanded ? "▼" : "▶"} {ins.suggestedFixes.length} suggested fix{ins.suggestedFixes.length !== 1 ? "es" : ""}
          </button>
          {expanded && (
            <div className="mt-2 bg-[#0a0a0f] rounded-lg p-3 border border-[#1e1e2e] space-y-2">
              <p className="text-[9px] font-mono text-[#4a4a6a] uppercase tracking-wider">Suggested Fixes</p>
              {ins.suggestedFixes.map((fix, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[#6c47ff] font-mono text-xs mt-0.5 flex-shrink-0">{i + 1}.</span>
                  <pre className="text-[10px] font-mono text-[#00e5a0] whitespace-pre-wrap leading-relaxed">{fix}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Summary bar ─────────────────────────────────────────────────────────────

function SummaryBar({ insights }: { insights: FailureInsight[] }) {
  const levels: InsightLevel[] = ["CRITICAL", "WARNING", "INFO", "SUCCESS"]
  const counts = Object.fromEntries(
    levels.map(l => [l, insights.filter(i => i.level === l).length])
  ) as Record<InsightLevel, number>

  const avgPriority = insights.length
    ? Math.round(insights.reduce((a, i) => a + (i.priorityScore ?? 0), 0) / insights.length)
    : 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {levels.map(level => {
        const cfg = LEVEL_CONFIG[level]
        return (
          <div key={level} className={cn("bg-[#111118] rounded-xl border p-3 lg:p-4", cfg.border)}>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#4a4a6a]">{level}</p>
            <p className={cn("text-2xl font-bold font-mono mt-1", cfg.text)}>{counts[level]}</p>
          </div>
        )
      })}
      <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-3 lg:p-4">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#4a4a6a]">Avg Priority</p>
        <p className={cn("text-2xl font-bold font-mono mt-1",
          avgPriority >= 80 ? "text-[#ff3b5c]"
          : avgPriority >= 50 ? "text-[#f59e0b]"
          : "text-[#a78bfa]"
        )}>{avgPriority}</p>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const [rules, setRules]               = useState<ChaosRuleResponse[]>([])
  const [target, setTarget]             = useState<string>("")
  const [customTarget, setCustomTarget] = useState("")
  const [useCustom, setUseCustom]       = useState(false)
  const [insights, setInsights]         = useState<FailureInsight[] | null>(null)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [rulesLoading, setRulesLoading] = useState(true)
  const [filter, setFilter]             = useState<InsightLevel | "ALL">("ALL")

  useEffect(() => {
    rulesApi.list()
      .then(data => {
        setRules(data)
        if (data.length > 0) setTarget(data[0].target)
      })
      .catch(() => {/* rules load failure is non-fatal */})
      .finally(() => setRulesLoading(false))
  }, [])

  const activeTarget = useCustom ? customTarget.trim() : target

  const fetchInsights = useCallback(async () => {
    if (!activeTarget) return
    setLoading(true)
    setError(null)
    try {
      const data = await insightsApi.forTarget(activeTarget)
      setInsights(data)
      setFilter("ALL")
    } catch {
      setError("Failed to load insights. Check backend connection.")
      setInsights(null)
    } finally {
      setLoading(false)
    }
  }, [activeTarget])

  const filteredInsights = (insights ?? []).filter(i =>
    filter === "ALL" || i.level === filter
  )

  const levelOrder: InsightLevel[] = ["CRITICAL", "WARNING", "INFO", "SUCCESS"]
  const sortedInsights = [...filteredInsights].sort((a, b) => {
    const ld = levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level)
    return ld !== 0 ? ld : (b.priorityScore ?? 0) - (a.priorityScore ?? 0)
  })

  return (
    <div className="space-y-4 lg:space-y-6 animate-slide-up">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-[#e8e8f0]">AI Insights</h2>
          <p className="text-xs text-[#4a4a6a] mt-0.5">Live resilience analysis powered by your chaos event data</p>
        </div>

        {insights && insights.length > 0 && (
          <div className="flex items-center gap-1 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg p-1">
            {(["ALL", "CRITICAL", "WARNING", "INFO", "SUCCESS"] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => setFilter(lvl)}
                className={cn(
                  "text-[10px] font-mono px-2.5 py-1 rounded transition-all",
                  filter === lvl
                    ? "bg-[#6c47ff] text-white"
                    : "text-[#4a4a6a] hover:text-[#e8e8f0]"
                )}
              >
                {lvl}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Target selector ── */}
      <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4 space-y-3">
        <p className="text-[10px] font-mono text-[#4a4a6a] uppercase tracking-wider">Select Target to Analyze</p>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* From Rules / Custom toggle */}
          <div className="flex items-center gap-1 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg p-1 h-fit self-start flex-shrink-0">
            <button
              onClick={() => setUseCustom(false)}
              className={cn(
                "text-xs font-mono px-3 py-1.5 rounded transition-all",
                !useCustom ? "bg-[#6c47ff] text-white" : "text-[#4a4a6a] hover:text-[#e8e8f0]"
              )}
            >
              From Rules
            </button>
            <button
              onClick={() => setUseCustom(true)}
              className={cn(
                "text-xs font-mono px-3 py-1.5 rounded transition-all",
                useCustom ? "bg-[#6c47ff] text-white" : "text-[#4a4a6a] hover:text-[#e8e8f0]"
              )}
            >
              Custom
            </button>
          </div>

          {/* Target input */}
          {!useCustom ? (
            <select
              value={target}
              onChange={e => setTarget(e.target.value)}
              disabled={rulesLoading || rules.length === 0}
              className="flex-1 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] font-mono focus:outline-none focus:border-[#6c47ff] disabled:opacity-40"
            >
              {rulesLoading && <option>Loading rules...</option>}
              {!rulesLoading && rules.length === 0 && (
                <option value="">No rules — create one in Chaos Rules first</option>
              )}
              {rules.map(r => (
                <option key={r.id} value={r.target}>
                  {r.target}{r.enabled ? " ● active" : " ○ disabled"}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={customTarget}
              onChange={e => setCustomTarget(e.target.value)}
              placeholder="/api/v1/orders or payment-service"
              onKeyDown={e => e.key === "Enter" && fetchInsights()}
              className="flex-1 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] font-mono focus:outline-none focus:border-[#6c47ff] placeholder:text-[#2a2a3a]"
            />
          )}

          <button
            onClick={fetchInsights}
            disabled={loading || !activeTarget}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2",
              loading || !activeTarget
                ? "bg-[#1e1e2e] text-[#4a4a6a] cursor-not-allowed"
                : "bg-[#6c47ff] text-white hover:bg-[#7c57ff] active:scale-95"
            )}
          >
            {loading
              ? <><span className="w-3 h-3 rounded-full border border-white border-t-transparent animate-spin" />Analyzing...</>
              : "Run Analysis →"
            }
          </button>
        </div>

        {activeTarget && (
          <p className="text-[10px] font-mono text-[#4a4a6a]">
            Target: <span className="text-[#a78bfa]">{activeTarget}</span>
          </p>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-[#ff3b5c]/10 border border-[#ff3b5c]/30 rounded-xl p-4 text-sm text-[#ff3b5c] font-mono">
          ⚠ {error}
        </div>
      )}

      {/* ── Summary bar ── */}
      {insights && insights.length > 0 && <SummaryBar insights={insights} />}

      {/* ── Cards grid ── */}
      {(loading || insights !== null) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {loading && (
            <div className="col-span-2 flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-[#6c47ff] border-t-transparent animate-spin mb-4" />
              <p className="text-xs font-mono text-[#4a4a6a]">Running insight algorithms...</p>
            </div>
          )}

          {!loading && insights !== null && sortedInsights.length === 0 && (
            <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#111118] border border-[#1e1e2e] flex items-center justify-center mb-4">
                <span className="text-2xl text-[#4a4a6a]">◎</span>
              </div>
              <h3 className="text-sm font-semibold text-[#e8e8f0] mb-1">
                No insights yet for <span className="text-[#a78bfa] font-mono">{activeTarget}</span>
              </h3>
              <p className="text-xs text-[#4a4a6a] max-w-xs">
                Run chaos experiments against this target to generate insights. The engine needs events to detect patterns.
              </p>
            </div>
          )}

          {!loading && sortedInsights.map((ins, i) => (
            <InsightCard key={`${ins.type}-${i}`} ins={ins} />
          ))}
        </div>
      )}

      {/* ── Initial state ── */}
      {!loading && insights === null && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-2xl bg-[#111118] border border-[#1e1e2e] flex items-center justify-center">
              <span className="text-3xl text-[#6c47ff]">◎</span>
            </div>
            <div className="absolute inset-0 rounded-2xl border border-[#6c47ff]/20 animate-ping" style={{ animationDuration: "3s" }} />
          </div>
          <h3 className="text-base font-semibold text-[#e8e8f0] mb-2">Ready to analyze</h3>
          <p className="text-xs text-[#4a4a6a] max-w-sm mb-8">
            Select a target and click <span className="text-[#a78bfa] font-mono">Run Analysis</span> to generate live AI insights from your chaos event data.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            {[
              { icon: "⬟", label: "Cascading Failure",  desc: "Causal impact detection" },
              { icon: "◈", label: "Blast Radius",        desc: "Config vs actual validation" },
              { icon: "▲", label: "Recovery Time",       desc: "MTTR measurement" },
            ].map(algo => (
              <div key={algo.label} className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
                <p className="text-xl text-[#6c47ff] mb-2">{algo.icon}</p>
                <p className="text-[11px] font-semibold text-[#e8e8f0]">{algo.label}</p>
                <p className="text-[10px] text-[#4a4a6a] mt-0.5">{algo.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}