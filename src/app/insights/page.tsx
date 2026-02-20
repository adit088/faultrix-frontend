"use client"
import { cn } from "@/lib/utils"

const insights = [
  { level: "CRITICAL", title: "Cascading Failure Risk Detected", target: "user-service → payment-service", confidence: 0.92, desc: "High failure rate on user-service is propagating to downstream payment-service. Blast radius exceeds safe threshold.", fix: `// Recommended: Add circuit breaker\n@CircuitBreaker(name = "payment", fallbackMethod = "paymentFallback")\npublic PaymentResponse process(PaymentRequest req) { ... }`, algorithm: "Causal Impact Analysis" },
  { level: "WARNING", title: "Latency Spike Pattern", target: "inventory-service", confidence: 0.78, desc: "Inventory service shows periodic latency spikes every ~45 minutes. Likely correlated with scheduled jobs.", fix: `# Schedule chaos tests outside job windows\ncron: "0 */1 * * *"  # ← adjust to avoid :00 and :45`, algorithm: "Time-Series Anomaly Detection" },
  { level: "INFO", title: "Blast Radius Recommendation", target: "All rules", confidence: 0.65, desc: "Current average blast radius of 42% is above recommended 25% for initial chaos experiments.", fix: `// Reduce blast radius gradually\nrule.setBlastRadius(0.25); // Start low, increase over sprints`, algorithm: "Risk Scoring Engine" },
  { level: "WARNING", title: "Uncovered Service Paths", target: "auth-service, notification-service", confidence: 0.71, desc: "No chaos rules configured for auth or notification services. These represent untested resilience gaps.", fix: `// Add rules for uncovered services\nPOST /api/v1/chaos/rules\n{ "target": "auth-service", "failureRate": 0.1 }`, algorithm: "Coverage Gap Detector" },
]

const levelColors: Record<string, { border: string; badge: string; text: string }> = {
  CRITICAL: { border: "border-[#ff3b5c]/40", badge: "bg-[#ff3b5c]/15 text-[#ff3b5c] border-[#ff3b5c]/30", text: "text-[#ff3b5c]" },
  WARNING:  { border: "border-[#f59e0b]/40", badge: "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30", text: "text-[#f59e0b]" },
  INFO:     { border: "border-[#6c47ff]/40", badge: "bg-[#6c47ff]/15 text-[#a78bfa] border-[#6c47ff]/30", text: "text-[#a78bfa]" },
}

export default function InsightsPage() {
  return (
    <div className="space-y-4 lg:space-y-6 animate-slide-up">
      <div>
        <h2 className="text-xl font-bold text-[#e8e8f0]">AI Insights</h2>
        <p className="text-xs text-[#4a4a6a]">ML-powered resilience recommendations</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {insights.map((ins, i) => {
          const colors = levelColors[ins.level]
          return (
            <div key={i} className={cn("bg-[#111118] rounded-xl border p-4 lg:p-5 space-y-3", colors.border)}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded border", colors.badge)}>{ins.level}</span>
                    <span className="text-[10px] text-[#4a4a6a] font-mono">{ins.algorithm}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#e8e8f0]">{ins.title}</h3>
                  <p className="text-xs text-[#4a4a6a] font-mono mt-0.5 truncate">{ins.target}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-[#4a4a6a]">Confidence</p>
                  <p className={cn("text-lg font-bold font-mono", colors.text)}>{Math.round(ins.confidence * 100)}%</p>
                </div>
              </div>
              <div className="h-1 bg-[#1e1e2e] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${ins.confidence * 100}%`, background: ins.level === "CRITICAL" ? "#ff3b5c" : ins.level === "WARNING" ? "#f59e0b" : "#6c47ff" }} />
              </div>
              <p className="text-xs text-[#8888aa] leading-relaxed">{ins.desc}</p>
              <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#1e1e2e] overflow-x-auto">
                <p className="text-[9px] font-mono text-[#4a4a6a] uppercase tracking-wider mb-2">Recommended Fix</p>
                <pre className="text-[10px] font-mono text-[#00e5a0] whitespace-pre-wrap leading-relaxed">{ins.fix}</pre>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}