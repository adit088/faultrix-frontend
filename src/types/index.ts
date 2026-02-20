// ─── Enums ────────────────────────────────────────────────────────────────────
export type ChaosType = "LATENCY" | "ERROR" | "EXCEPTION" | "BLACKHOLE" | "CPU" | "MEMORY"
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
  // Metadata
  confidenceScore?: number
  affectedRequests?: number
  observedFailureRate?: number
  expectedFailureRate?: number
  avgRecoveryTimeMs?: number
  firstDetected?: string
  lastDetected?: string
  // Impact
  estimatedImpact?: string
  estimatedCost?: string
  priorityScore?: number
  // Actionable
  relatedTargets?: string[]
  suggestedFixes?: string[]
  codeSnippet?: string
  documentationUrl?: string
  // Trend
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