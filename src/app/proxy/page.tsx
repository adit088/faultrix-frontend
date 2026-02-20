"use client"
import { useState } from "react"
import { proxyApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { ProxyResponse, ProxyChaosType } from "@/types"

// ─── Constants ────────────────────────────────────────────────────────────────

const BACKEND_URL = "https://faultrix-backend-production.up.railway.app/api/v1"

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"]

const CHAOS_TYPE_COLORS: Record<ProxyChaosType, string> = {
  // Original types
  LATENCY:        "text-[#f59e0b]",
  ERROR_4XX:      "text-[#ff3b5c]",
  ERROR_5XX:      "text-[#ff3b5c]",
  TIMEOUT:        "text-[#ff3b5c]",
  EXCEPTION:      "text-[#ff3b5c]",
  NONE:           "text-[#00e5a0]",
  // New types
  PACKET_LOSS:    "text-[#ff3b5c]",
  DNS_FAILURE:    "text-[#ff3b5c]",
  BANDWIDTH_LIMIT:"text-[#f59e0b]",
  CORRUPT_BODY:   "text-[#a78bfa]",
  HEADER_INJECT:  "text-[#a78bfa]",
  CPU_SPIKE:      "text-[#f59e0b]",
  MEMORY_PRESSURE:"text-[#f59e0b]",
  BLACKHOLE:      "text-[#ff3b5c]",
}

const CODE_EXAMPLES = {
  curl: (url: string) => `curl -X POST ${BACKEND_URL}/proxy/forward \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "method": "GET",
    "url": "${url}"
  }'`,

  python: (url: string) => `import requests

response = requests.post(
    "${BACKEND_URL}/proxy/forward",
    headers={"X-API-Key": "YOUR_API_KEY"},
    json={
        "method": "GET",
        "url": "${url}",
    }
)

data = response.json()
if data["chaosInjected"]:
    print(f"Chaos injected: {data['chaosType']}")
else:
    print("Clean request:", data["status"])`,

  node: (url: string) => `const response = await fetch(
  "${BACKEND_URL}/proxy/forward",
  {
    method: "POST",
    headers: {
      "X-API-Key": "YOUR_API_KEY",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method: "GET",
      url: "${url}",
    }),
  }
);

const data = await response.json();
if (data.chaosInjected) {
  console.log("Chaos injected:", data.chaosType);
} else {
  console.log("Clean request:", data.status);
}`,

  java: (url: string) => `// Add to your Spring Boot service:
// Change your RestTemplate base URL to route through Faultrix

@Service
public class PaymentService {

    private static final String FAULTRIX_PROXY =
        "${BACKEND_URL}/proxy/forward";

    public ResponseEntity<String> callUpstream(String upstreamUrl) {
        ProxyRequest req = new ProxyRequest();
        req.setMethod("GET");
        req.setUrl("${url}");

        return restTemplate.postForEntity(
            FAULTRIX_PROXY, req, String.class
        );
    }
}`,
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#1e1e2e] text-[#4a4a6a] hover:text-[#e8e8f0] hover:bg-[#2a2a3a] transition-all"
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  )
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  return (
    <div className="bg-[#0a0a0f] rounded-xl border border-[#1e1e2e] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e1e2e]">
        <span className="text-[10px] font-mono text-[#4a4a6a] uppercase tracking-wider">{lang}</span>
        <CopyButton text={code} />
      </div>
      <pre className="p-4 text-[11px] font-mono text-[#00e5a0] overflow-x-auto leading-relaxed whitespace-pre">
        {code}
      </pre>
    </div>
  )
}

function StatusBadge({ status }: { status: number }) {
  const color = status < 300 ? "text-[#00e5a0] border-[#00e5a0]/30 bg-[#00e5a0]/10"
    : status < 500 ? "text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/10"
    : "text-[#ff3b5c] border-[#ff3b5c]/30 bg-[#ff3b5c]/10"
  return (
    <span className={cn("text-xs font-mono font-bold px-2 py-0.5 rounded border", color)}>
      {status}
    </span>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProxyPage() {
  const [method, setMethod]         = useState("GET")
  const [url, setUrl]               = useState("https://jsonplaceholder.typicode.com/users/1")
  const [body, setBody]             = useState("")
  const [headerKey, setHeaderKey]   = useState("")
  const [headerVal, setHeaderVal]   = useState("")
  const [headers, setHeaders]       = useState<Record<string, string>>({})
  const [loading, setLoading]       = useState(false)
  const [result, setResult]         = useState<ProxyResponse | null>(null)
  const [error, setError]           = useState<string | null>(null)
  const [activeTab, setActiveTab]   = useState<"curl" | "python" | "node" | "java">("curl")
  const [showBody, setShowBody]     = useState(false)

  const addHeader = () => {
    if (!headerKey.trim()) return
    setHeaders(h => ({ ...h, [headerKey.trim()]: headerVal.trim() }))
    setHeaderKey("")
    setHeaderVal("")
  }

  const removeHeader = (key: string) => {
    setHeaders(h => { const n = { ...h }; delete n[key]; return n })
  }

  const runProxy = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await proxyApi.forward({
        method,
        url: url.trim(),
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        body: body.trim() || undefined,
      })
      setResult(data)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error"
      setError(`Proxy request failed: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  const exampleUrl = "https://jsonplaceholder.typicode.com/users/1"

  return (
    <div className="space-y-6 animate-slide-up">

      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-xl font-bold text-[#e8e8f0]">HTTP Chaos Proxy</h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-[#00e5a0]/10 text-[#00e5a0] border-[#00e5a0]/30">
            ZERO SDK
          </span>
        </div>
        <p className="text-xs text-[#4a4a6a]">
          Route any outbound HTTP call through Faultrix. Chaos injected automatically based on your rules.
        </p>
      </div>

      {/* ── How it works ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { step: "1", icon: "⇢", title: "Route your calls", desc: "Send outbound HTTP calls to the Faultrix proxy instead of calling upstream directly" },
          { step: "2", icon: "◈", title: "Chaos is decided", desc: "Your rules, schedules & blast radius config determine whether chaos is injected" },
          { step: "3", icon: "◎", title: "Events + insights", desc: "Every call is logged. The AI engine generates insights from the chaos event data" },
        ].map(item => (
          <div key={item.step} className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-[#6c47ff]/20 text-[#a78bfa] text-[10px] font-bold font-mono flex items-center justify-center border border-[#6c47ff]/30">
                {item.step}
              </span>
              <span className="text-base">{item.icon}</span>
            </div>
            <p className="text-xs font-semibold text-[#e8e8f0] mb-1">{item.title}</p>
            <p className="text-[10px] text-[#4a4a6a] leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Live Tester ── */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[#e8e8f0]">Live Tester</p>
          <span className="text-[10px] font-mono text-[#4a4a6a]">Calls your backend proxy directly</span>
        </div>

        {/* Method + URL */}
        <div className="flex gap-2">
          <select
            value={method}
            onChange={e => setMethod(e.target.value)}
            className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] font-mono focus:outline-none focus:border-[#6c47ff] w-28 flex-shrink-0"
          >
            {HTTP_METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://api.yourservice.com/endpoint"
            onKeyDown={e => e.key === "Enter" && runProxy()}
            className="flex-1 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] font-mono focus:outline-none focus:border-[#6c47ff] placeholder:text-[#2a2a3a]"
          />
          <button
            onClick={runProxy}
            disabled={loading || !url.trim()}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 flex-shrink-0",
              loading || !url.trim()
                ? "bg-[#1e1e2e] text-[#4a4a6a] cursor-not-allowed"
                : "bg-[#6c47ff] text-white hover:bg-[#7c57ff] active:scale-95"
            )}
          >
            {loading
              ? <><span className="w-3 h-3 rounded-full border border-white border-t-transparent animate-spin" />Sending...</>
              : "Send →"
            }
          </button>
        </div>

        {/* Headers */}
        <div>
          <p className="text-[10px] font-mono text-[#4a4a6a] uppercase tracking-wider mb-2">Headers (optional)</p>
          <div className="flex gap-2 mb-2">
            <input
              value={headerKey}
              onChange={e => setHeaderKey(e.target.value)}
              placeholder="Key"
              className="flex-1 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-1.5 text-xs text-[#e8e8f0] font-mono focus:outline-none focus:border-[#6c47ff] placeholder:text-[#2a2a3a]"
            />
            <input
              value={headerVal}
              onChange={e => setHeaderVal(e.target.value)}
              placeholder="Value"
              onKeyDown={e => e.key === "Enter" && addHeader()}
              className="flex-1 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-1.5 text-xs text-[#e8e8f0] font-mono focus:outline-none focus:border-[#6c47ff] placeholder:text-[#2a2a3a]"
            />
            <button
              onClick={addHeader}
              className="px-3 py-1.5 rounded-lg bg-[#1e1e2e] text-[#a78bfa] text-xs font-mono hover:bg-[#2a2a3a] transition-colors"
            >
              + Add
            </button>
          </div>
          {Object.entries(headers).map(([k, v]) => (
            <div key={k} className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-[#a78bfa] bg-[#6c47ff]/10 px-2 py-0.5 rounded border border-[#6c47ff]/20">
                {k}: {v}
              </span>
              <button onClick={() => removeHeader(k)} className="text-[#4a4a6a] hover:text-[#ff3b5c] text-xs transition-colors">✕</button>
            </div>
          ))}
        </div>

        {/* Body */}
        {["POST", "PUT", "PATCH"].includes(method) && (
          <div>
            <p className="text-[10px] font-mono text-[#4a4a6a] uppercase tracking-wider mb-2">Request Body (JSON)</p>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={4}
              placeholder='{ "key": "value" }'
              className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-xs text-[#e8e8f0] font-mono focus:outline-none focus:border-[#6c47ff] placeholder:text-[#2a2a3a] resize-none"
            />
          </div>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-[#ff3b5c]/10 border border-[#ff3b5c]/30 rounded-xl p-4 text-sm text-[#ff3b5c] font-mono">
          ⚠ {error}
        </div>
      )}

      {/* ── Result ── */}
      {result && (
        <div className={cn(
          "rounded-xl border p-5 space-y-4",
          result.chaosInjected ? "bg-[#111118] border-[#ff3b5c]/40" : "bg-[#111118] border-[#00e5a0]/40"
        )}>
          {/* Result header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-3 h-3 rounded-full flex-shrink-0",
                result.chaosInjected ? "bg-[#ff3b5c] animate-pulse" : "bg-[#00e5a0]"
              )} />
              <span className={cn(
                "text-sm font-bold",
                result.chaosInjected ? "text-[#ff3b5c]" : "text-[#00e5a0]"
              )}>
                {result.chaosInjected ? `Chaos Injected — ${result.chaosType}` : "Clean Request — No Chaos"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={result.status} />
              {result.injectedDelayMs > 0 && (
                <span className="text-xs font-mono text-[#f59e0b]">+{result.injectedDelayMs}ms latency</span>
              )}
            </div>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#1e1e2e]">
              <p className="text-[9px] font-mono text-[#4a4a6a] uppercase tracking-wider">Target Matched</p>
              <p className="text-xs font-mono text-[#a78bfa] mt-1 truncate">{result.target}</p>
            </div>
            <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#1e1e2e]">
              <p className="text-[9px] font-mono text-[#4a4a6a] uppercase tracking-wider">Chaos Type</p>
              <p className={cn("text-xs font-mono font-bold mt-1", result.chaosType ? CHAOS_TYPE_COLORS[result.chaosType] : "text-[#00e5a0]")}>
                {result.chaosType ?? "NONE"}
              </p>
            </div>
            <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#1e1e2e]">
              <p className="text-[9px] font-mono text-[#4a4a6a] uppercase tracking-wider">Request ID</p>
              <p className="text-[9px] font-mono text-[#8888aa] mt-1 truncate">{result.requestId}</p>
            </div>
            <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#1e1e2e]">
              <p className="text-[9px] font-mono text-[#4a4a6a] uppercase tracking-wider">Delay Injected</p>
              <p className="text-xs font-mono font-bold text-[#f59e0b] mt-1">{result.injectedDelayMs}ms</p>
            </div>
          </div>

          {/* Faultrix response headers */}
          {result.headers && Object.keys(result.headers).some(k => k.startsWith("X-Faultrix")) && (
            <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#1e1e2e]">
              <p className="text-[9px] font-mono text-[#4a4a6a] uppercase tracking-wider mb-2">Faultrix Headers</p>
              {Object.entries(result.headers)
                .filter(([k]) => k.startsWith("X-Faultrix"))
                .map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2 text-[10px] font-mono mb-1">
                    <span className="text-[#6c47ff]">{k}:</span>
                    <span className="text-[#e8e8f0]">{v}</span>
                  </div>
                ))
              }
            </div>
          )}

          {/* Response body */}
          {result.body && (
            <div>
              <button
                onClick={() => setShowBody(b => !b)}
                className="text-[10px] font-mono text-[#4a4a6a] hover:text-[#a78bfa] transition-colors flex items-center gap-1 mb-2"
              >
                {showBody ? "▼" : "▶"} Response body
              </button>
              {showBody && (
                <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#1e1e2e] overflow-x-auto">
                  <pre className="text-[10px] font-mono text-[#8888aa] whitespace-pre-wrap leading-relaxed">
                    {(() => {
                      try { return JSON.stringify(JSON.parse(result.body!), null, 2) }
                      catch { return result.body }
                    })()}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Integration Guide ── */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 space-y-4">
        <div>
          <p className="text-sm font-semibold text-[#e8e8f0] mb-1">Integration Guide</p>
          <p className="text-xs text-[#4a4a6a]">
            Copy the code below into your app. Replace <span className="text-[#a78bfa] font-mono">YOUR_API_KEY</span> with your key.
            No SDK, no dependency, no redeploy needed.
          </p>
        </div>

        {/* Proxy endpoint box */}
        <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#6c47ff]/30 flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-mono text-[#4a4a6a] uppercase tracking-wider mb-1">Proxy Endpoint</p>
            <p className="text-xs font-mono text-[#a78bfa]">POST {BACKEND_URL}/proxy/forward</p>
          </div>
          <CopyButton text={`${BACKEND_URL}/proxy/forward`} />
        </div>

        {/* Language tabs */}
        <div className="flex items-center gap-1 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg p-1 w-fit">
          {(["curl", "python", "node", "java"] as const).map(lang => (
            <button
              key={lang}
              onClick={() => setActiveTab(lang)}
              className={cn(
                "text-[10px] font-mono px-3 py-1.5 rounded transition-all",
                activeTab === lang
                  ? "bg-[#6c47ff] text-white"
                  : "text-[#4a4a6a] hover:text-[#e8e8f0]"
              )}
            >
              {lang}
            </button>
          ))}
        </div>

        <CodeBlock
          code={CODE_EXAMPLES[activeTab](url || exampleUrl)}
          lang={activeTab}
        />
      </div>

      {/* ── How target matching works ── */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
        <p className="text-sm font-semibold text-[#e8e8f0] mb-3">How Target Matching Works</p>
        <p className="text-xs text-[#4a4a6a] mb-4">
          The proxy extracts the <span className="text-[#a78bfa] font-mono">path</span> from the upstream URL
          and matches it against your chaos rules — exact, prefix, or regex.
        </p>
        <div className="space-y-2">
          {[
            { url: "https://api.stripe.com/v1/charges", target: "/v1/charges", rule: "/v1/charges (EXACT)" },
            { url: "https://api.stripe.com/v1/charges/ch_123", target: "/v1/charges/ch_123", rule: "/v1/ (PREFIX)" },
            { url: "https://payments.svc/health", target: "/health", rule: "/health (EXACT)" },
          ].map(ex => (
            <div key={ex.url} className="flex items-center gap-2 text-[10px] font-mono flex-wrap">
              <span className="text-[#4a4a6a]">{ex.url}</span>
              <span className="text-[#1e1e2e]">→</span>
              <span className="text-[#a78bfa]">target: {ex.target}</span>
              <span className="text-[#1e1e2e]">→</span>
              <span className="text-[#00e5a0]">matches rule: {ex.rule}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}