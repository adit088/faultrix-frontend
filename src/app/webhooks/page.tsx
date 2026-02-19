"use client"
import { useState } from "react"
import type { WebhookConfig } from "@/types"
import { cn } from "@/lib/utils"

const mockWebhooks: WebhookConfig[] = [
  { id: 1, url: "https://hooks.slack.com/services/T0xxx/Byyy/zzz", enabled: true, events: ["chaos.injected", "chaos.skipped"], createdAt: new Date().toISOString() },
  { id: 2, url: "https://api.pagerduty.com/v2/enqueue", enabled: true, events: ["chaos.injected"], createdAt: new Date().toISOString() },
  { id: 3, url: "https://example.com/chaos-webhook", enabled: false, events: ["chaos.injected", "chaos.skipped", "rule.toggled"], createdAt: new Date().toISOString() },
]

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(mockWebhooks)

  const toggleHook = (id: number) => {
    setWebhooks(w => w.map(h => h.id === id ? { ...h, enabled: !h.enabled } : h))
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#e8e8f0]">Webhooks</h2>
          <p className="text-xs text-[#4a4a6a]">HMAC-signed event delivery endpoints</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-[#6c47ff] text-white text-sm font-medium hover:bg-[#7c57ff]">
          + Add Webhook
        </button>
      </div>

      <div className="space-y-3">
        {webhooks.map(hook => (
          <div key={hook.id} className={cn(
            "bg-[#111118] rounded-xl border p-5 transition-all",
            hook.enabled ? "border-[#1e1e2e]" : "border-[#1e1e2e] opacity-60"
          )}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("w-2 h-2 rounded-full", hook.enabled ? "bg-[#00e5a0] animate-pulse" : "bg-[#4a4a6a]")} />
                  <span className="text-xs font-mono text-[#8888aa] truncate">{hook.url}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {hook.events.map(ev => (
                    <span key={ev} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6c47ff]/10 text-[#a78bfa] border border-[#6c47ff]/20">
                      {ev}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-[#4a4a6a]">HMAC-SHA256</span>
                <button
                  onClick={() => toggleHook(hook.id)}
                  className={cn(
                    "w-9 h-5 rounded-full transition-all relative",
                    hook.enabled ? "bg-[#00e5a0]/80" : "bg-[#2a2a3e]"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
                    hook.enabled ? "translate-x-4" : "translate-x-0.5"
                  )} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
