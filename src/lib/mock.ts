import type { ChaosRuleResponse, ChaosEventResponse, ChaosAnalyticsResponse, KillSwitchStatus, TrafficStats } from "@/types"

export const mockRules: ChaosRuleResponse[] = [
  { id: 1, organizationId: 1, target: "user-service", failureRate: 0.3, maxDelayMs: 2000, enabled: true, blastRadius: 0.5, description: "Simulate DB timeouts", targetingMode: "EXACT", createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), updatedAt: new Date().toISOString() },
  { id: 2, organizationId: 1, target: "payment-service", failureRate: 0.1, maxDelayMs: 500, enabled: true, blastRadius: 0.2, description: "Payment latency injection", targetingMode: "EXACT", createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), updatedAt: new Date().toISOString() },
  { id: 3, organizationId: 1, target: "/api/orders.*", failureRate: 0.5, maxDelayMs: 5000, enabled: false, blastRadius: 1.0, description: "Order endpoint failures", targetingMode: "REGEX", createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), updatedAt: new Date().toISOString() },
  { id: 4, organizationId: 1, target: "inventory-service", failureRate: 0.8, maxDelayMs: 1000, enabled: true, blastRadius: 0.3, description: "Inventory chaos test", targetingMode: "EXACT", createdAt: new Date(Date.now() - 86400000 * 14).toISOString(), updatedAt: new Date().toISOString() },
]

export const mockEvents: ChaosEventResponse[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  organizationId: 1,
  chaosRuleId: (i % 4) + 1,
  target: ["user-service", "payment-service", "/api/orders", "inventory-service"][i % 4],
  requestId: `req-${Math.random().toString(36).slice(2, 10)}`,
  chaosType: (["LATENCY", "ERROR", "EXCEPTION", "BLACKHOLE"] as const)[i % 4],
  injected: i % 3 !== 0,
  httpStatus: i % 3 === 0 ? 200 : [500, 503, 429][i % 3],
  delayMs: i % 3 !== 0 ? Math.floor(Math.random() * 3000) : undefined,
  failureRate: 0.3,
  blastRadius: 0.5,
  occurredAt: new Date(Date.now() - i * 30000).toISOString(),
}))

export const mockAnalytics: ChaosAnalyticsResponse = {
  from: new Date(Date.now() - 86400000).toISOString(),
  to: new Date().toISOString(),
  windowLabel: "Last 24h",
  totalEvents: 1247,
  injectedCount: 891,
  skippedCount: 356,
  injectionRate: 0.714,
  avgInjectedLatencyMs: 1823,
  topTargets: [
    { target: "user-service", injectionCount: 412 },
    { target: "payment-service", injectionCount: 287 },
    { target: "inventory-service", injectionCount: 192 },
  ],
  typeBreakdown: { LATENCY: 534, ERROR: 245, EXCEPTION: 87, BLACKHOLE: 25, CPU: 0, MEMORY: 0 },
  timeSeries: Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, "0")}:00`,
    total: Math.floor(30 + Math.random() * 70),
    injected: Math.floor(20 + Math.random() * 50),
    avgDelayMs: Math.floor(500 + Math.random() * 2000),
  })),
}

export const mockKillSwitch: KillSwitchStatus = { enabled: false }
export const mockTraffic: TrafficStats = { total: 1247, injected: 891, skipped: 356, injectionRate: 0.714 }
