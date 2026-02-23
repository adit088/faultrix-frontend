"use client"
import { useEffect, useState } from "react"

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0)
  // phase 0 = hidden, 1 = logo in, 2 = creator in, 3 = exiting

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 80)
    const t2 = setTimeout(() => setPhase(2), 900)
    const t3 = setTimeout(() => setPhase(3), 2200)
    const t4 = setTimeout(onDone, 2950)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [onDone])

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{
        background: "#05050d",
        opacity: phase === 3 ? 0 : 1,
        transform: phase === 3 ? "scale(1.03)" : "scale(1)",
        filter: phase === 3 ? "blur(8px)" : "none",
        transition: "opacity 700ms cubic-bezier(0.22,1,0.36,1), transform 700ms cubic-bezier(0.22,1,0.36,1), filter 700ms cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* Deep radial bg */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 70% 60% at 50% 50%, #0f0820 0%, #05050d 100%)",
      }} />

      {/* Subtle grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(to right, #ffffff04 1px, transparent 1px), linear-gradient(to bottom, #ffffff04 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      {/* Glowing orb behind logo */}
      <div style={{
        position: "absolute",
        width: 320, height: 320,
        borderRadius: "50%",
        background: "radial-gradient(circle, #6c47ff18 0%, transparent 70%)",
        top: "50%", left: "50%",
        transform: "translate(-50%, -60%)",
        opacity: phase >= 1 ? 1 : 0,
        transition: "opacity 1200ms ease",
      }} />

      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>

        {/* LOGO + WORDMARK */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 900ms cubic-bezier(0.16,1,0.3,1), transform 900ms cubic-bezier(0.16,1,0.3,1)",
        }}>
          {/* Spinning icon rings */}
          <div style={{ position: "relative", width: 64, height: 64, marginBottom: 20 }}>
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: "1.5px solid transparent",
              borderTopColor: "#6c47ff",
              borderRightColor: "#6c47ff30",
              animation: "fx-spin 2s linear infinite",
            }} />
            <div style={{
              position: "absolute", inset: 4, borderRadius: "50%",
              border: "1.5px solid transparent",
              borderBottomColor: "#00e5a0",
              borderLeftColor: "#00e5a030",
              animation: "fx-spin-rev 3s linear infinite",
            }} />
            <div style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <defs>
                  <linearGradient id="sp-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#6c47ff" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                  <linearGradient id="sp-crack" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#6c47ff" />
                    <stop offset="100%" stopColor="#00e5a0" />
                  </linearGradient>
                </defs>
                <polygon points="4,4 17,4 17,14 10,14 10,10 4,10" fill="url(#sp-g)" opacity="0.95" />
                <polygon points="4,18 10,18 10,28 4,28" fill="url(#sp-g)" opacity="0.75" />
                <polygon points="20,6 28,6 28,26 20,26 20,20 24,20 24,12 20,12" fill="url(#sp-g)" opacity="0.9" />
                <line x1="4" y1="28" x2="28" y2="4" stroke="url(#sp-crack)" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="27" cy="5" r="2.5" fill="#00e5a0" />
              </svg>
            </div>
          </div>

          {/* FAULTRIX wordmark */}
          <div style={{ overflow: "hidden" }}>
            <h1 style={{
              fontSize: "clamp(2rem, 8vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "0.35em",
              color: "#e8e8f0",
              textTransform: "uppercase",
              margin: 0,
              lineHeight: 1,
              transform: phase >= 1 ? "translateY(0)" : "translateY(100%)",
              opacity: phase >= 1 ? 1 : 0,
              transition: "transform 1000ms cubic-bezier(0.16,1,0.3,1) 100ms, opacity 1000ms ease 100ms",
            }}>
              Faultrix
            </h1>
          </div>

          {/* Scanning gradient line */}
          <div style={{
            marginTop: 16, width: 180, height: 1,
            background: "linear-gradient(to right, transparent, #6c47ff, #00e5a0, transparent)",
            opacity: phase >= 1 ? 0.7 : 0,
            transition: "opacity 600ms ease 400ms",
          }} />

          <p style={{
            marginTop: 10, fontSize: 10, letterSpacing: "0.5em",
            textTransform: "uppercase", color: "#4a4a6a",
            fontFamily: "monospace", margin: "10px 0 0 0",
            opacity: phase >= 1 ? 1 : 0,
            transition: "opacity 800ms ease 500ms",
          }}>
            Chaos Engineering
          </p>
        </div>

        {/* CREATOR CREDIT — the hero moment */}
        <div style={{
          marginTop: 44,
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? "translateY(0)" : "translateY(14px)",
          transition: "opacity 700ms cubic-bezier(0.16,1,0.3,1), transform 700ms cubic-bezier(0.16,1,0.3,1)",
        }}>
          {/* Separator with "crafted by" */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12, marginBottom: 14,
          }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #ffffff08)" }} />
            <span style={{ fontSize: 9, letterSpacing: "0.45em", color: "#30305a", fontFamily: "monospace", textTransform: "uppercase" }}>
              crafted by
            </span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, #ffffff08)" }} />
          </div>

          {/* @Adit874319 pill — the star */}
          <a
            href="https://x.com/Adit874319"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              textDecoration: "none",
              padding: "11px 22px",
              borderRadius: 14,
              border: "1px solid #6c47ff35",
              background: "linear-gradient(135deg, #6c47ff0d 0%, #00e5a00a 100%)",
              cursor: "pointer",
            }}
          >
            {/* X icon */}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#7c6aff" style={{ flexShrink: 0 }}>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>

            {/* Handle with gradient */}
            <span style={{
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.04em",
              fontFamily: "monospace",
              background: "linear-gradient(90deg, #c4b5fd 0%, #818cf8 35%, #00e5a0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              @Adit874319
            </span>

            {/* Live pulse dot */}
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#00e5a0",
              boxShadow: "0 0 10px #00e5a0aa",
              animation: "fx-pulse 2s ease-in-out infinite",
              flexShrink: 0,
            }} />
          </a>
        </div>
      </div>

      <style>{`
        @keyframes fx-spin { to { transform: rotate(360deg); } }
        @keyframes fx-spin-rev { to { transform: rotate(-360deg); } }
        @keyframes fx-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.65); }
        }
      `}</style>
    </div>
  )
}