import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          position: "relative",
        }}
      >
        {/* Cinematic Deep Bloom (Purple/Cyan mix) */}
        <div
          style={{
            position: "absolute",
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(108,71,255,0.4) 0%, rgba(0,229,160,0.1) 50%, transparent 80%)",
            filter: "blur(5px)",
          }}
        />

        {/* The Obsidian Kinetic Shard */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.8))" }}
        >
          <defs>
            {/* Iridescent Surface Gradient */}
            <linearGradient id="shardBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a1a2e" /> {/* Dark Obsidian Base */}
              <stop offset="50%" stopColor="#3b2b85" /> 
              <stop offset="100%" stopColor="#1a1a2e" />
            </linearGradient>

            {/* Neon Glitch Mask */}
            <linearGradient id="neonPulse" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6c47ff" />
              <stop offset="100%" stopColor="#00e5a0" />
            </linearGradient>
          </defs>

          {/* 1. DARK OUTER RIM (The "Cool Asf" Border) */}
          <path
            d="M25 20 L85 15 L75 85 L35 75 Z"
            fill="#050508"
            stroke="#111118"
            strokeWidth="8"
            strokeLinejoin="round"
          />

          {/* 2. MAIN SHARD BODY */}
          <path
            d="M25 20 L85 15 L75 85 L35 75 Z"
            fill="url(#shardBody)"
            stroke="rgba(255,255,255,0.15)" // Inner Light-Wrap
            strokeWidth="1"
          />

          {/* 3. THE "FAULT" CORE FRACTURE */}
          <path
            d="M25 20 L75 85"
            stroke="url(#neonPulse)"
            strokeWidth="4"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 5px #00e5a0)" }}
          />

          {/* 4. REFLECTIVE SPECULAR (Glass shine) */}
          <path
            d="M85 15 L75 85 L60 50 Z"
            fill="white"
            style={{ opacity: 0.1 }}
          />

          {/* 5. THE SINGULARITY (Center Glow) */}
          <circle 
            cx="48" 
            cy="45" 
            r="4" 
            fill="white" 
            style={{ filter: "drop-shadow(0 0 4px #6c47ff)" }}
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}