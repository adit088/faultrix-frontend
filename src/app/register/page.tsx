"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { authApi } from "@/lib/api"

// ── Tiny logo ──────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6c47ff" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="rc" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6c47ff" />
          <stop offset="100%" stopColor="#00e5a0" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="#111118" />
      <rect width="32" height="32" rx="8" fill="none" stroke="url(#rg)" strokeWidth="0.8" opacity="0.6" />
      <polygon points="4,4 17,4 17,14 10,14 10,10 4,10" fill="url(#rg)" opacity="0.9" />
      <polygon points="4,18 10,18 10,28 4,28" fill="url(#rg)" opacity="0.7" />
      <polygon points="20,6 28,6 28,26 20,26 20,20 24,20 24,12 20,12" fill="url(#rg)" opacity="0.85" />
      <line x1="4" y1="28" x2="28" y2="4" stroke="url(#rc)" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="27" cy="5" r="2.5" fill="#00e5a0" opacity="0.9" />
    </svg>
  )
}

// ── API Key Reveal ─────────────────────────────────────────────────────────────
// This component shows the raw API key ONCE so the user can copy it to their
// password manager / .env file. The key is passed as a prop from state — it's
// never stored in localStorage. The HttpOnly cookie is already set by the
// server-side auth route before this component even mounts.
function ApiKeyReveal({ apiKey, onContinue }: { apiKey: string; onContinue: () => void }) {
  const [copied, setCopied] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-[#00e5a0]/10 border border-[#00e5a0]/30 flex items-center justify-center mx-auto text-2xl">
          🔑
        </div>
        <h2 className="text-xl font-bold text-[#e8e8f0]">Your API Key</h2>
        <p className="text-xs text-[#4a4a6a]">
          This is shown <span className="text-[#ff3b5c] font-semibold">once only</span>. Copy it now — we never store the raw key.
        </p>
      </div>

      {/* Key box */}
      <div className="bg-[#0a0a0f] border border-[#00e5a0]/40 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[9px] font-mono text-[#4a4a6a] uppercase tracking-wider">API Key</p>
          <button
            onClick={copy}
            className={cn(
              "text-[10px] font-mono px-3 py-1 rounded-lg border transition-all",
              copied
                ? "bg-[#00e5a0]/10 border-[#00e5a0]/40 text-[#00e5a0]"
                : "bg-[#1e1e2e] border-[#2a2a3a] text-[#8888aa] hover:text-[#e8e8f0] hover:border-[#6c47ff]/50"
            )}
          >
            {copied ? "✓ Copied!" : "Copy"}
          </button>
        </div>
        <p className="font-mono text-xs text-[#a78bfa] break-all leading-relaxed bg-[#111118] rounded-lg p-3 border border-[#1e1e2e]">
          {apiKey}
        </p>
      </div>

      {/* Warning */}
      <div className="bg-[#ff3b5c]/5 border border-[#ff3b5c]/20 rounded-xl p-3 flex items-start gap-3">
        <span className="text-[#ff3b5c] text-base flex-shrink-0">⚠</span>
        <p className="text-xs text-[#ff3b5c]/80 leading-relaxed">
          Store this key in your password manager or environment variables. If you lose it, you'll need to generate a new one.
        </p>
      </div>

      {/* Confirm checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <div
          onClick={() => setConfirmed(c => !c)}
          className={cn(
            "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all cursor-pointer",
            confirmed
              ? "bg-[#6c47ff] border-[#6c47ff]"
              : "border-[#2a2a3a] group-hover:border-[#6c47ff]/50"
          )}
        >
          {confirmed && <span className="text-white text-xs font-bold">✓</span>}
        </div>
        <span className="text-xs text-[#8888aa] leading-relaxed group-hover:text-[#e8e8f0] transition-colors">
          I've copied my API key and understand I cannot retrieve it again
        </span>
      </label>

      {/* Continue button */}
      <button
        onClick={onContinue}
        disabled={!confirmed}
        className={cn(
          "w-full py-3 rounded-xl text-sm font-semibold transition-all",
          confirmed
            ? "bg-[#6c47ff] text-white hover:bg-[#7c57ff] active:scale-[0.98]"
            : "bg-[#1e1e2e] text-[#4a4a6a] cursor-not-allowed"
        )}
      >
        Enter Dashboard →
      </button>
    </div>
  )
}

// ── Main Register Page ─────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter()

  const [step, setStep]         = useState<"form" | "key">("form")
  const [orgName, setOrgName]   = useState("")
  const [email, setEmail]       = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [apiKey, setApiKey]     = useState("")  // only held in React state, never localStorage

  const handleRegister = async () => {
    if (!orgName.trim() || !email.trim()) return
    setLoading(true)
    setError(null)

    try {
      // authApi.register() calls our Next.js /api/auth/register route.
      // That route calls the backend, gets the raw API key, sets an HttpOnly
      // fx_session cookie, and returns the apiKey in the response body once
      // (so we can display it to the user for copying).
      // After this component unmounts, the key is gone from JS memory.
      const res = await authApi.register(orgName.trim(), email.trim())

      // Store the key in React state ONLY — for displaying on the next screen.
      // It's NOT going into localStorage. The HttpOnly cookie is already set.
      setApiKey(res.apiKey)
      setStep("key")
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Registration failed"
      setError(msg.includes("already exists") ? "That organization name is taken — try another." : msg)
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    // Clear the key from state now that the user has confirmed they copied it
    setApiKey("")
    router.replace("/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#6c47ff]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#00e5a0]/4 blur-[120px] pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e1e2e12_1px,transparent_1px),linear-gradient(to_bottom,#1e1e2e12_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-md">

        {/* Card */}
        <div className="bg-[#111118]/80 backdrop-blur-xl border border-[#1e1e2e] rounded-2xl p-8 shadow-2xl shadow-black/40">

          {step === "form" ? (
            <div className="space-y-6 animate-slide-up">

              {/* Header */}
              <div className="flex items-center gap-3 mb-2">
                <Logo />
                <div>
                  <h1 className="text-lg font-bold text-[#e8e8f0] tracking-tight">Faultrix</h1>
                  <p className="text-[10px] font-mono text-[#4a4a6a] uppercase tracking-widest">Chaos Engineering</p>
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold text-[#e8e8f0]">Create your account</h2>
                <p className="text-xs text-[#4a4a6a]">Free forever. No credit card required.</p>
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2">
                {["10 chaos rules", "HTTP proxy", "AI insights", "Webhooks"].map(f => (
                  <span key={f} className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#6c47ff]/10 border border-[#6c47ff]/20 text-[#a78bfa]">
                    ✓ {f}
                  </span>
                ))}
              </div>

              {/* Form */}
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono text-[#4a4a6a] uppercase tracking-wider block mb-1.5">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleRegister()}
                    placeholder="Acme Corp"
                    autoFocus
                    className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl px-4 py-3 text-sm text-[#e8e8f0] placeholder:text-[#2a2a3a] focus:outline-none focus:border-[#6c47ff] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#4a4a6a] uppercase tracking-wider block mb-1.5">
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleRegister()}
                    placeholder="you@company.com"
                    className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl px-4 py-3 text-sm text-[#e8e8f0] placeholder:text-[#2a2a3a] focus:outline-none focus:border-[#6c47ff] transition-colors"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-[#ff3b5c]/10 border border-[#ff3b5c]/30 rounded-xl p-3 text-xs text-[#ff3b5c] font-mono">
                  ⚠ {error}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleRegister}
                disabled={loading || !orgName.trim() || !email.trim()}
                className={cn(
                  "w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2",
                  loading || !orgName.trim() || !email.trim()
                    ? "bg-[#1e1e2e] text-[#4a4a6a] cursor-not-allowed"
                    : "bg-[#6c47ff] text-white hover:bg-[#7c57ff] active:scale-[0.98] shadow-lg shadow-[#6c47ff]/20"
                )}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Free Account →"
                )}
              </button>

              {/* Login link */}
              <p className="text-center text-xs text-[#4a4a6a]">
                Already have an API key?{" "}
                <button
                  onClick={() => router.push("/login")}
                  className="text-[#a78bfa] hover:text-[#6c47ff] transition-colors font-medium"
                >
                  Sign in
                </button>
              </p>

            </div>
          ) : (
            <ApiKeyReveal apiKey={apiKey} onContinue={handleContinue} />
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-[#2a2a3a] mt-6 font-mono">
          FAULTRIX — CHAOS ENGINEERING PLATFORM
        </p>

      </div>
    </div>
  )
}