// ─── Enums ────────────────────────────────────────────────────────────────────
export type ChaosType =
  | "LATENCY" | "ERROR_4XX" | "ERROR_5XX" | "TIMEOUT"
  | "EXCEPTION" | "PACKET_LOSS" | "DNS_FAILURE" | "BANDWIDTH_LIMIT"
  | "CORRUPT_BODY" | "HEADER_INJECT" | "CPU_SPIKE" | "MEMORY_PRESSURE"
  | "BLACKHOLE" | "NONE"
export type TargetingMode = "EXACT" | "PREFIX" | "REGEX"
export type InsightLevel = "SUCCESS" | "INFO" | "WARNING" | "CRITICAL"

export type InsightType =
  | "CASCADING_FAILURE" | "FAILURE_OVERRUN" | "CIRCUIT_BREAKER_MISSING" | "RETRY_STORM"
  | "LATENCY_AMPLIFICATION" | "TIMEOUT_MISSING" | "SLOW_RECOVERY"
  | "LOW_SAMPLE_BIAS" | "PEAK_HOUR_FRAGILITY" | "BLAST_RADIUS_MISMATCH"
  | "RESOURCE_EXHAUSTION" | "QUEUE_BUILDUP" | "RATE_LIMIT_HIT"
  | "MISSING_FALLBACK" | "CACHE_POISONING" | "DEPENDENCY_HELL"
  | "RESILIENT_SYSTEM" | "OPTIMAL_RECOVERY" | "GOOD_ISOLATION"

export interface FailureInsight {
  type: InsightType
  level: InsightLevel
  title: string
  message: string
  recommendation: string
  confidenceScore?: number
  affectedRequests?: number
  observedFailureRate?: number
  expectedFailureRate?: number
  avgRecoveryTimeMs?: number
  firstDetected?: string
  lastDetected?: string
  estimatedImpact?: string
  estimatedCost?: string
  priorityScore?: number
  relatedTargets?: string[]
  suggestedFixes?: string[]
  codeSnippet?: string
  documentationUrl?: string
  trend?: "WORSENING" | "STABLE" | "IMPROVING" | "NEW"
  occurrenceCount?: number
  trendPercentage?: number
}

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
  // BUG FIX: Backend ChaosEventService.getAnalytics() returns hour as a string from
  // EXTRACT(HOUR ...) cast via String.valueOf(((Number) row[0]).intValue()).
  // This is a plain integer string ("0"–"23"), NOT an HH:mm formatted string like "00:00".
  // InjectionChart.tsx was trying to match these as if they were pre-formatted — fixed in chart.
  timeSeries: { hour: string; total: number; injected: number; avgDelayMs?: number }[]
}

// ─── Schedules ────────────────────────────────────────────────────────────────
export interface ChaosScheduleResponse {
  id: number
  chaosRuleId: number
  organizationId: number
  name: string
  enabled: boolean
  daysOfWeek: string
  startTime: string
  endTime: string
  activeFrom?: string
  activeUntil?: string
  createdAt?: string
  updatedAt?: string
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
  organizationId: number
  name: string
  url: string
  hasSecret: boolean
  enabled: boolean
  onInjection: boolean
  onSkipped: boolean
  chaosTypes?: string
  createdAt: string
  updatedAt: string
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
// BUG FIX: Backend ChaosControlController returns Map.of("enabled", ..., "message", ...)
// The "reason" and "updatedAt" fields don't exist in the backend response.
// Frontend was trying to read them but they were always undefined.
// Fixed: use "message" (what backend actually sends).
export interface KillSwitchStatus {
  enabled: boolean
  message?: string   // backend sends "enabled" + "message" — previously "reason" which didn't exist
}

// ─── Experiments ─────────────────────────────────────────────────────────────
export interface TrafficStats {
  total: number
  injected: number
  skipped: number
  injectionRate: number
}

// Cursor-based pagination (matches backend PageResponse<T>)
export interface PageResponse<T> {
  data: T[]
  pagination: {
    nextCursor: number | null
    hasMore: boolean
    count: number
    limit: number
  }
}

// Alias kept for backwards compat — events endpoint also returns this shape
export interface Page<T> {
  data: T[]
  pagination: {
    nextCursor: number | null
    hasMore: boolean
    count: number
    limit: number
  }
}

// ─── Proxy ────────────────────────────────────────────────────────────────────
export interface ProxyRequest {
  method: string
  url: string
  headers?: Record<string, string>
  body?: string
}

export type ProxyChaosType =
  | "LATENCY" | "ERROR_4XX" | "ERROR_5XX"
  | "TIMEOUT" | "EXCEPTION" | "NONE"
  | "PACKET_LOSS" | "DNS_FAILURE" | "BANDWIDTH_LIMIT"
  | "CORRUPT_BODY" | "HEADER_INJECT" | "CPU_SPIKE"
  | "MEMORY_PRESSURE" | "BLACKHOLE"

export interface ProxyResponse {
  status: number
  body: string | null
  headers: Record<string, string>
  chaosInjected: boolean
  chaosType: ProxyChaosType | null
  injectedDelayMs: number
  target: string
  requestId: string
  processedAt: string
}