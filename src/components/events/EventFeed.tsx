"use client"
import { useState, useEffect } from "react"
import { cn, timeAgo } from "@/lib/utils"
import { eventsApi } from "@/lib/api"
import type { ChaosEventResponse } from "@/types"

const typeColors: Record<string, string> = {
  LATENCY:          "text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/10",
  ERROR_4XX:        "text-[#ff3b5c] border-[#ff3b5c]/30 bg-[#ff3b5c]/10",
  ERROR_5XX:        "text-[#ff3b5c] border-[#ff3b5c]/30 bg-[#ff3b5c]/10",
  TIMEOUT:          "text-[#ff3b5c] border-[#ff3b5c]/30 bg-[#ff3b5c]/10",
  EXCEPTION:        "text-[#ff6b35] border-[#ff6b35]/30 bg-[#ff6b35]/10",
  PACKET_LOSS:      "text-[#ff3b5c] border-[#ff3b5c]/30 bg-[#ff3b5c]/10",
  DNS_FAILURE:      "text-[#ff3b5c] border-[#ff3b5c]/30 bg-[#ff3b5c]/10",
  BANDWIDTH_LIMIT:  "text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/10",
  CORRUPT_BODY:     "text-[#ff6b35] border-[#ff6b35]/30 bg-[#ff6b35]/10",
  HEADER_INJECT:    "text-[#a78bfa] border-[#a78bfa]/30 bg-[#a78bfa]/10",
  CPU_SPIKE:        "text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/10",
  MEMORY_PRESSURE:  "text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/10",
  BLACKHOLE:        "text-[#8888aa] border-[#8888aa]/30 bg-[#8888aa]/10",
  NONE:             "text-[#4a4a6a] border-[#4a4a6a]/30 bg-[#4a4a6a]/10",
}

function EventRow({ ev }: { ev: ChaosEventResponse }) {
  return (
    <div className="flex items-center gap-2 lg:gap-3 py-2.5 border-b border-[#1e1e2e]/50 animate-fade-in text-sm min-w-[420px]">
      <div className={cn("w-2 h-2 rounded-full flex-shrink-0", ev.injected ? "bg-[#ff3b5c]" : "bg-[#4a4a6a]")} />
      <span className="font-mono text-[#8888aa] text-xs w-20 truncate">{ev.requestId?.slice(-8) ?? "–"}</span>
      <span className="text-[#e8e8f0] flex-1 truncate text-xs lg:text-sm">{ev.target}</span>
      {ev.chaosType && (
        <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded border flex-shrink-0", typeColors[ev.chaosType] ?? "text-[#8888aa]")}>
          {ev.chaosType}
        </span>
      )}
      <span className={cn("text-xs font-mono flex-shrink-0", ev.injected ? "text-[#ff3b5c]" : "text-[#00e5a0]")}>
        {ev.injected ? ev.httpStatus ?? "ERR" : "SKIP"}
      </span>
      <span className="text-[10px] text-[#4a4a6a] w-14 text-right flex-shrink-0">{timeAgo(ev.occurredAt)}</span>
    </div>
  )
}

export default function EventFeed({ limit = 8 }: { limit?: number }) {
  const [events, setEvents] = useState<ChaosEventResponse[]>([])
  const [connecting, setConnecting] = useState(true)

  useEffect(() => {
    async function poll() {
      try {
        const page = await eventsApi.list({ page: 0, limit })
        setEvents(page.data ?? [])
        setConnecting(false)
      } catch {
        // Keep showing last known events, just don't crash
      }
    }

    poll()
    const interval = setInterval(poll, 5000) // poll every 5s for live feel
    return () => clearInterval(interval)
  }, [limit])

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center gap-2 lg:gap-3 pb-2 text-[10px] font-mono uppercase text-[#4a4a6a] border-b border-[#1e1e2e] min-w-[420px]">
        <div className="w-2" />
        <span className="w-20">Request ID</span>
        <span className="flex-1">Target</span>
        <span className="w-20">Type</span>
        <span className="w-8">Status</span>
        <span className="w-14 text-right">Time</span>
      </div>
      {connecting ? (
        <div className="py-8 text-center text-xs text-[#4a4a6a] font-mono animate-pulse">
          Connecting to event stream...
        </div>
      ) : events.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#4a4a6a] font-mono">
          No events yet. Chaos rules will populate this feed.
        </div>
      ) : (
        events.map(ev => <EventRow key={ev.id} ev={ev} />)
      )}
    </div>
  )
}