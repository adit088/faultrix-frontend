"use client"
import { useState, useEffect } from "react"
import { webhooksApi } from "@/lib/api"
import type { WebhookConfig } from "@/types"
import { cn } from "@/lib/utils"

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [secret, setSecret] = useState("")
  const [onInjection, setOnInjection] = useState(true)
  const [onSkipped, setOnSkipped] = useState(false)
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      const data = await webhooksApi.list()
      setWebhooks(data)
    } catch {
      console.error("Failed to load webhooks")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const toggleHook = async (hook: WebhookConfig) => {
    // Optimistic update
    setWebhooks(w => w.map(h => h.id === hook.id ? { ...h, enabled: !h.enabled } : h))
    try {
      // FIX BUG-8: backend WebhookRequest has @NotBlank on name and @NotBlank @URL on url.
      // Sending only { enabled } returns HTTP 400. Must send the full object every time.
      await webhooksApi.update(hook.id, {
        name:        hook.name,
        url:         hook.url,
        enabled:     !hook.enabled,
        onInjection: hook.onInjection,
        onSkipped:   hook.onSkipped,
        chaosTypes:  hook.chaosTypes,
        // secret intentionally omitted — backend only updates secret when the field is non-null
      })
    } catch {
      // Roll back optimistic update on failure
      setWebhooks(w => w.map(h => h.id === hook.id ? { ...h, enabled: hook.enabled } : h))
    }
  }

  const deleteHook = async (id: number) => {
    if (!confirm("Delete this webhook?")) return
    try {
      setWebhooks(w => w.filter(h => h.id !== id))
      await webhooksApi.delete(id)
    } catch {
      load()
    }
  }

  const createHook = async () => {
    if (!name.trim() || !url.trim()) return
    setSaving(true)
    try {
      const created = await webhooksApi.create({
        name: name.trim(),
        url: url.trim(),
        secret: secret.trim() || undefined,
        enabled: true,
        onInjection,
        onSkipped,
      })
      setWebhooks(w => [...w, created])
      setShowForm(false)
      setName(""); setUrl(""); setSecret("")
      setOnInjection(true); setOnSkipped(false)
    } catch {
      alert("Failed to create webhook.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-[#6c47ff] border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="space-y-4 lg:space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#e8e8f0]">Webhooks</h2>
          <p className="text-xs text-[#4a4a6a]">HMAC-signed event delivery endpoints</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-3 py-2 lg:px-4 rounded-lg bg-[#6c47ff] text-white text-sm font-medium hover:bg-[#7c57ff]">
          + Add Webhook
        </button>
      </div>

      {showForm && (
        <div className="bg-[#111118] rounded-xl border border-[#6c47ff]/40 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-[#e8e8f0]">New Webhook</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-mono uppercase text-[#4a4a6a] block mb-1">Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Slack alerts" className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] focus:border-[#6c47ff] outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-[#4a4a6a] block mb-1">Endpoint URL *</label>
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://hooks.slack.com/..." className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] focus:border-[#6c47ff] outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-[#4a4a6a] block mb-1">Secret (optional)</label>
              <input value={secret} onChange={e => setSecret(e.target.value)} placeholder="HMAC signing secret" className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] focus:border-[#6c47ff] outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-[#4a4a6a] block mb-2">Trigger On</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={onInjection} onChange={e => setOnInjection(e.target.checked)} className="w-4 h-4 accent-[#6c47ff]" />
                  <span className="text-xs text-[#e8e8f0]">chaos.injected</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={onSkipped} onChange={e => setOnSkipped(e.target.checked)} className="w-4 h-4 accent-[#6c47ff]" />
                  <span className="text-xs text-[#e8e8f0]">chaos.skipped</span>
                </label>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={createHook} disabled={saving || !name.trim() || !url.trim()} className="px-4 py-2 rounded-lg bg-[#6c47ff] text-white text-sm font-medium hover:bg-[#7c57ff] disabled:opacity-50">
              {saving ? "Creating..." : "Create Webhook"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-[#1e1e2e] text-[#8888aa] text-sm hover:text-[#e8e8f0]">Cancel</button>
          </div>
        </div>
      )}

      {webhooks.length === 0 && !showForm && (
        <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-12 text-center">
          <p className="text-[#4a4a6a] text-sm font-mono">No webhooks configured yet.</p>
          <p className="text-[#4a4a6a] text-xs mt-1">Add a webhook to receive chaos events in Slack, PagerDuty, or any HTTP endpoint.</p>
        </div>
      )}

      <div className="space-y-3">
        {webhooks.map(hook => (
          <div key={hook.id} className={cn("bg-[#111118] rounded-xl border p-4 lg:p-5 transition-all group", hook.enabled ? "border-[#1e1e2e]" : "border-[#1e1e2e] opacity-60")}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0", hook.enabled ? "bg-[#00e5a0] animate-pulse" : "bg-[#4a4a6a]")} />
                  <span className="text-sm font-medium text-[#e8e8f0]">{hook.name}</span>
                </div>
                <p className="text-xs font-mono text-[#8888aa] truncate mb-2">{hook.url}</p>
                <div className="flex flex-wrap gap-1.5">
                  {hook.onInjection && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ff3b5c]/10 text-[#ff3b5c] border border-[#ff3b5c]/20">chaos.injected</span>
                  )}
                  {hook.onSkipped && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6c47ff]/10 text-[#a78bfa] border border-[#6c47ff]/20">chaos.skipped</span>
                  )}
                  {hook.hasSecret && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00e5a0]/10 text-[#00e5a0] border border-[#00e5a0]/20">HMAC-SHA256</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => deleteHook(hook.id)} className="opacity-0 group-hover:opacity-100 text-[#ff3b5c]/60 hover:text-[#ff3b5c] text-xs transition-all">✕</button>
                <button onClick={() => toggleHook(hook)} className={cn("w-9 h-5 rounded-full transition-all relative", hook.enabled ? "bg-[#00e5a0]/80" : "bg-[#2a2a3e]")}>
                  <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform", hook.enabled ? "translate-x-4" : "translate-x-0.5")} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}