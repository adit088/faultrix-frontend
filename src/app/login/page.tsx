"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { authApi } from "@/lib/api"

function Logo() {
  return (
    <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6c47ff" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="lc" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6c47ff" />
          <stop offset="100%" stopColor="#00e5a0" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="#111118" />
      <rect width="32" height="32" rx="8" fill="none" stroke="url(#lg)" strokeWidth="0.8" opacity="0.6" />
      <polygon points="4,4 17,4 17,14 10,14 10,10 4,10" fill="url(#lg)" opacity="0.9" />
      <polygon points="4,18 10,18 10,28 4,28" fill="url(#lg)" opacity="0.7" />
      <polygon points="20,6 28,6 28,26 20,26 20,20 24,20 24,12 20,12" fill="url(#lg)" opacity="0.85" />
      <line x1="4" y1="28" x2="28" y2="4" stroke="url(#lc)" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="27" cy="5" r="2.5" fill="#00e5a0" opacity="0.9" />
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [apiKey, setApiKey]   = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [show, setShow]       = useState(false)

  const handleLogin = async () => {
    if (!apiKey.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await authApi.login(apiKey.trim())
      // Store session info
      localStorage.setItem("fx_api_key",  apiKey.trim())
      localStorage.setItem("fx_org_name", res.orgName)
      localStorage.setItem("fx_org_slug", res.slug)
      localStorage.setItem("fx_plan",     res.plan)
      router.replace("/dashboard")
    } catch {
      setError("Invalid API key. Check your key and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#6c47ff]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#00e5a0]/4 blur-[120px] pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e1e2e12_1px,transparent_1px),linear-gradient(to_bottom,#1e1e2e12_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-md">

        <div className="bg-[#111118]/80 backdrop-blur-xl border border-[#1e1e2e] rounded-2xl p-8 shadow-2xl shadow-black/40 space-y-6 animate-slide-up">

          {/* Header */}
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <h1 className="text-lg font-bold text-[#e8e8f0] tracking-tight">Faultrix</h1>
              <p className="text-[10px] font-mono text-[#4a4a6a] uppercase tracking-widest">Chaos Engineering</p>
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#e8e8f0]">Welcome back</h2>
            <p className="text-xs text-[#4a4a6a]">Enter your API key to continue.</p>
          </div>

          {/* Key input */}
          <div>
            <label className="text-[10px] font-mono text-[#4a4a6a] uppercase tracking-wider block mb-1.5">
              API Key
            </label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="ck_test_..."
                autoFocus
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl px-4 py-3 pr-12 text-sm text-[#e8e8f0] placeholder:text-[#2a2a3a] focus:outline-none focus:border-[#6c47ff] transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a4a6a] hover:text-[#8888aa] transition-colors text-xs font-mono"
              >
                {show ? "hide" : "show"}
              </button>
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
            onClick={handleLogin}
            disabled={loading || !apiKey.trim()}
            className={cn(
              "w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2",
              loading || !apiKey.trim()
                ? "bg-[#1e1e2e] text-[#4a4a6a] cursor-not-allowed"
                : "bg-[#6c47ff] text-white hover:bg-[#7c57ff] active:scale-[0.98] shadow-lg shadow-[#6c47ff]/20"
            )}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Verifying...
              </>
            ) : (
              "Enter Dashboard →"
            )}
          </button>

          {/* Register link */}
          <p className="text-center text-xs text-[#4a4a6a]">
            Don&apos;t have an account?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-[#a78bfa] hover:text-[#6c47ff] transition-colors font-medium"
            >
              Create one free
            </button>
          </p>

        </div>

        <p className="text-center text-[10px] text-[#2a2a3a] mt-6 font-mono">
          FAULTRIX — CHAOS ENGINEERING PLATFORM
        </p>
      </div>
    </div>
  )
}