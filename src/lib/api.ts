import axios from "axios"
import type {
  ChaosRuleResponse, ChaosRuleRequest, ChaosRuleStats,
  ChaosEventResponse, ChaosAnalyticsResponse,
  ChaosScheduleResponse, ChaosScheduleRequest,
  WebhookConfig, KillSwitchStatus, TrafficStats, Page,
  FailureInsight, ProxyRequest, ProxyResponse,
} from "@/types"

// Calls our own Next.js API proxy — API key never reaches the browser
const http = axios.create({ baseURL: "/api/proxy" })

// ─── Rules ────────────────────────────────────────────────────────────────────
export const rulesApi = {
  list: () => http.get<ChaosRuleResponse[]>("/chaos/rules").then(r => r.data),
  paginated: (page = 0, size = 20) =>
    http.get<Page<ChaosRuleResponse>>("/chaos/rules/paginated", { params: { page, size } }).then(r => r.data),
  get: (id: number) => http.get<ChaosRuleResponse>(`/chaos/rules/${id}`).then(r => r.data),
  stats: () => http.get<ChaosRuleStats>("/chaos/rules/stats").then(r => r.data),
  enabled: () => http.get<ChaosRuleResponse[]>("/chaos/rules/enabled").then(r => r.data),
  create: (body: ChaosRuleRequest) => http.post<ChaosRuleResponse>("/chaos/rules", body).then(r => r.data),
  update: (id: number, body: ChaosRuleRequest) => http.put<ChaosRuleResponse>(`/chaos/rules/${id}`, body).then(r => r.data),
  toggle: (id: number, enabled: boolean) => http.patch<ChaosRuleResponse>(`/chaos/rules/${id}`, { enabled }).then(r => r.data),
  delete: (id: number) => http.delete(`/chaos/rules/${id}`),
}

// ─── Events ───────────────────────────────────────────────────────────────────
export const eventsApi = {
  list: (params?: { page?: number; size?: number; target?: string }) =>
    http.get<Page<ChaosEventResponse>>("/chaos/events", { params }).then(r => r.data),
  analytics: (window?: string) =>
    http.get<ChaosAnalyticsResponse>("/chaos/events/analytics", { params: { window } }).then(r => r.data),
}

// ─── Schedules ────────────────────────────────────────────────────────────────
export const schedulesApi = {
  list: (ruleId: number) =>
    http.get<ChaosScheduleResponse[]>(`/chaos/rules/${ruleId}/schedules`).then(r => r.data),
  create: (ruleId: number, body: ChaosScheduleRequest) =>
    http.post<ChaosScheduleResponse>(`/chaos/rules/${ruleId}/schedules`, body).then(r => r.data),
  update: (ruleId: number, scheduleId: number, body: ChaosScheduleRequest) =>
    http.put<ChaosScheduleResponse>(`/chaos/rules/${ruleId}/schedules/${scheduleId}`, body).then(r => r.data),
  delete: (ruleId: number, scheduleId: number) =>
    http.delete(`/chaos/rules/${ruleId}/schedules/${scheduleId}`),
}

// ─── Control (Kill Switch) ────────────────────────────────────────────────────
export const controlApi = {
  status: () => http.get<KillSwitchStatus>("/chaos/control/status").then(r => r.data),
  enable: () => http.post<KillSwitchStatus>("/chaos/control/enable").then(r => r.data),
  disable: () => http.post<KillSwitchStatus>("/chaos/control/disable").then(r => r.data),
  toggle: () => http.post<KillSwitchStatus>("/chaos/control/toggle").then(r => r.data),
}

// ─── Experiments / Traffic ────────────────────────────────────────────────────
export const experimentsApi = {
  traffic: () => http.get<TrafficStats>("/experiments/traffic").then(r => r.data),
  reset: () => http.post("/experiments/control/reset"),
}

// ─── Webhooks ────────────────────────────────────────────────────────────────
export const webhooksApi = {
  list: () => http.get<WebhookConfig[]>("/chaos/events/webhooks").then(r => r.data),
  create: (body: Partial<WebhookConfig>) =>
    http.post<WebhookConfig>("/chaos/events/webhooks", body).then(r => r.data),
  update: (id: number, body: Partial<WebhookConfig>) =>
    http.put<WebhookConfig>(`/chaos/events/webhooks/${id}`, body).then(r => r.data),
  delete: (id: number) => http.delete(`/chaos/events/webhooks/${id}`),
}

// ─── Insights ─────────────────────────────────────────────────────────────────
export const insightsApi = {
  // Backend: GET /api/v1/insights?target=xxx
  // Proxy:   GET /api/proxy/insights?target=xxx
  forTarget: (target: string) =>
    http.get<FailureInsight[]>("/insights", { params: { target } }).then(r => r.data),
}

// ─── Proxy ────────────────────────────────────────────────────────────────────
export const proxyApi = {
  // POST /api/proxy/proxy/forward → backend /api/v1/proxy/forward
  forward: (body: ProxyRequest) =>
    http.post<ProxyResponse>("/proxy/forward", body).then(r => r.data),
  health: () =>
    http.get("/proxy/health").then(r => r.data),
}

// ─── System ───────────────────────────────────────────────────────────────────
export const systemApi = {
  info: () => http.get("/system/info").then(r => r.data),
}