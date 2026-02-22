import axios from "axios"
import type {
  ChaosRuleResponse, ChaosRuleRequest, ChaosRuleStats,
  ChaosEventResponse, ChaosAnalyticsResponse,
  ChaosScheduleResponse, ChaosScheduleRequest,
  WebhookConfig, KillSwitchStatus, TrafficStats, Page,
  FailureInsight, ProxyRequest, ProxyResponse,
} from "@/types"

// All API calls go through our Next.js proxy route.
// The proxy route reads the API key from the HttpOnly fx_session cookie server-side
// and injects it into the X-API-Key header before forwarding to the backend.
// Client-side JS never sees or handles the API key at all.
const http = axios.create({ baseURL: "/api/proxy" })

// NOTE: No request interceptor injecting an API key header.
// The browser automatically sends the HttpOnly cookie with every same-origin request.
// The Next.js proxy route (/api/proxy/[...path]) reads the cookie server-side and
// injects the key into the upstream request. Zero client-side key handling.

// Auto-logout on 401 — session expired or key revoked
http.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      // Call the server-side logout route to clear the HttpOnly cookie
      // (client JS cannot clear HttpOnly cookies directly)
      try {
        await fetch("/api/auth/logout", { method: "POST" })
      } catch {
        // best-effort
      }
      window.location.href = "/login"
    }
    return Promise.reject(err)
  }
)

// ─── Auth (public — no API key required) ──────────────────────────────────────
export const authApi = {
  register: (orgName: string, email: string) =>
    axios.post<{ orgId: number; orgName: string; slug: string; apiKey: string; plan: string; maxRules: number; message: string }>(
      "/api/auth/register", { orgName, email }
    ).then(r => r.data),

  login: (apiKey: string) =>
    axios.post<{ orgId: number; orgName: string; slug: string; plan: string; maxRules: number; valid: boolean }>(
      "/api/auth/login", { apiKey }
    ).then(r => r.data),

  // Checks session validity without exposing the key. Used by Shell for auth guards.
  session: () =>
    fetch("/api/auth/session").then(r => {
      if (!r.ok) throw new Error("No session")
      return r.json() as Promise<{ authenticated: boolean; orgName: string; slug: string; plan: string; maxRules: number }>
    }),

  logout: () =>
    fetch("/api/auth/logout", { method: "POST" }),
}

// ─── Rules ────────────────────────────────────────────────────────────────────
export const rulesApi = {
  list: () => http.get<ChaosRuleResponse[]>("/chaos/rules").then(r => r.data),
  paginated: (cursor?: number, limit = 20) =>
    http.get<Page<ChaosRuleResponse>>("/chaos/rules/paginated", { params: { cursor, limit } }).then(r => r.data),
  get: (id: number) => http.get<ChaosRuleResponse>(`/chaos/rules/${id}`).then(r => r.data),
  stats: () => http.get<ChaosRuleStats>("/chaos/rules/stats").then(r => r.data),
  enabled: () => http.get<ChaosRuleResponse[]>("/chaos/rules/enabled").then(r => r.data),
  create: (body: ChaosRuleRequest) => http.post<ChaosRuleResponse>("/chaos/rules", body).then(r => r.data),
  update: (id: number, body: ChaosRuleRequest) => http.put<ChaosRuleResponse>(`/chaos/rules/${id}`, body).then(r => r.data),
  delete: (id: number) => http.delete(`/chaos/rules/${id}`),
}

// ─── Events ───────────────────────────────────────────────────────────────────
export const eventsApi = {
  list: (params?: { page?: number; limit?: number; target?: string }) =>
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
  create: (body: { name: string; url: string; secret?: string; enabled?: boolean; onInjection?: boolean; onSkipped?: boolean; chaosTypes?: string }) =>
    http.post<WebhookConfig>("/chaos/events/webhooks", body).then(r => r.data),
  update: (id: number, body: { name?: string; url?: string; secret?: string; enabled?: boolean; onInjection?: boolean; onSkipped?: boolean; chaosTypes?: string }) =>
    http.put<WebhookConfig>(`/chaos/events/webhooks/${id}`, body).then(r => r.data),
  delete: (id: number) => http.delete(`/chaos/events/webhooks/${id}`),
}

// ─── Insights ─────────────────────────────────────────────────────────────────
export const insightsApi = {
  forTarget: (target: string) =>
    http.get<FailureInsight[]>("/insights", { params: { target } }).then(r => r.data),
}

// ─── Proxy ────────────────────────────────────────────────────────────────────
export const proxyApi = {
  forward: (body: ProxyRequest) =>
    http.post<ProxyResponse>("/proxy/forward", body).then(r => r.data),
  health: () =>
    http.get("/proxy/health").then(r => r.data),
}

// ─── System ───────────────────────────────────────────────────────────────────
export const systemApi = {
  info: () => http.get("/system/info").then(r => r.data),
}