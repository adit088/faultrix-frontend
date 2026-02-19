// ─── Enums ────────────────────────────────────────────────────────────────────
export type ChaosType = "LATENCY" | "ERROR" | "EXCEPTION" | "BLACKHOLE" | "CPU" | "MEMORY"
export type TargetingMode = "EXACT" | "PREFIX" | "REGEX"
export type InsightLevel = "INFO" | "WARNING" | "CRITICAL"

// ─── Chaos Rules ──────────────────────────────────────────────────────────────
export interface ChaosRuleResponse {
  id: number
  organizationId: number
  target: string
  targetPattern?: string
  targetingMode?: TargetingMode
  failureRate: number
  maxDelayMs: number
  enabled: boolean
  description?: string
  blastRadius?: number
  seed?: number
  tags?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  version?: number
}

export interface ChaosRuleRequest {
  target: string
  targetPattern?: string
  targetingMode?: TargetingMode
  failureRate: number
  maxDelayMs: number
  enabled: boolean
  description?: string
  blastRadius?: number
  seed?: number
  tags?: string
}

export interface ChaosRuleStats {
  totalRules: number
  enabledRules: number
  disabledRules: number
  maxRulesAllowed: number
  remainingRules: number
  currentPlan: string
}

// ─── Chaos Events ─────────────────────────────────────────────────────────────
export interface ChaosEventResponse {
  id: number
  organizationId: number
  chaosRuleId?: number
  target: string
  requestId?: string
  chaosType?: ChaosType
  injected: boolean
  httpStatus?: number
  delayMs?: number
  failureRate?: number
  blastRadius?: number
  occurredAt: string
}

export interface ChaosAnalyticsResponse {
  from: string
  to: string
  windowLabel: string
  totalEvents: number
  injectedCount: number
  skippedCount: number
  injectionRate: number
  avgInjectedLatencyMs?: number
  topTargets: { target: string; injectionCount: number }[]
  typeBreakdown: Record<ChaosType, number>
  timeSeries: { hour: string; total: number; injected: number; avgDelayMs?: number }[]
}

// ─── Schedules ────────────────────────────────────────────────────────────────
export interface ChaosScheduleResponse {
  id: number
  ruleId: number
  name: string
  enabled: boolean
  daysOfWeek: string
  startTime: string
  endTime: string
  activeFrom?: string
  activeUntil?: string
}

export interface ChaosScheduleRequest {
  name: string
  enabled?: boolean
  daysOfWeek?: string
  startTime?: string
  endTime?: string
  activeFrom?: string
  activeUntil?: string
}

// ─── Webhooks ─────────────────────────────────────────────────────────────────
export interface WebhookConfig {
  id: number
  url: string
  secret?: string
  enabled: boolean
  events: string[]
  createdAt: string
}

export interface WebhookDelivery {
  id: number
  webhookId: number
  eventType: string
  statusCode?: number
  success: boolean
  attemptedAt: string
  responseTimeMs?: number
}

// ─── Control ──────────────────────────────────────────────────────────────────
export interface KillSwitchStatus {
  enabled: boolean
  reason?: string
  updatedAt?: string
}

// ─── Experiments ─────────────────────────────────────────────────────────────
export interface TrafficStats {
  total: number
  injected: number
  skipped: number
  injectionRate: number
}

// ─── Paginated ────────────────────────────────────────────────────────────────
export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
