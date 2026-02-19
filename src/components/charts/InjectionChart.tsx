"use client"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { ChaosAnalyticsResponse } from "@/types"

interface Props { analytics: ChaosAnalyticsResponse }

export default function InjectionChart({ analytics }: Props) {
  const data = analytics.timeSeries.map(p => ({
    hour: p.hour,
    total: p.total,
    injected: p.injected,
    skipped: p.total - p.injected,
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="injected-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#6c47ff" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#6c47ff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="skipped-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#1e1e2e" stopOpacity={0.6} />
            <stop offset="95%" stopColor="#1e1e2e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#1e1e2e" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="hour" tick={{ fill: "#4a4a6a", fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
        <YAxis tick={{ fill: "#4a4a6a", fontSize: 10 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#e8e8f0" }}
          itemStyle={{ color: "#a78bfa" }}
        />
        <Area type="monotone" dataKey="injected" stroke="#6c47ff" strokeWidth={2} fill="url(#injected-grad)" name="Injected" />
        <Area type="monotone" dataKey="skipped"  stroke="#2a2a3e" strokeWidth={1} fill="url(#skipped-grad)"  name="Skipped" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
