import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmt(n: number | undefined | null, decimals = 1) {
  if (n == null || isNaN(n)) return "0"
  return n.toLocaleString("en-US", { maximumFractionDigits: decimals })
}

export function pct(n: number | undefined | null) {
  if (n == null || isNaN(n)) return "0.0%"
  return `${(n * 100).toFixed(1)}%`
}

export function fmtMs(ms: number | undefined | null) {
  if (ms == null || isNaN(ms)) return "0ms"
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`
}

export function timeAgo(iso: string | undefined | null) {
  if (!iso) return "—"
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return `${h}h ago`
}