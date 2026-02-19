"use client"

interface BlastRadiusDialProps {
  value: number // 0 to 1
}

export default function BlastRadiusDial({ value }: BlastRadiusDialProps) {
  const pct = Math.round(value * 100)
  const r = 54
  const circumference = 2 * Math.PI * r
  const dashOffset = circumference * (1 - value)
  const color = value > 0.7 ? "#ff3b5c" : value > 0.4 ? "#f59e0b" : "#00e5a0"

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Track */}
          <circle cx="60" cy="60" r={r} fill="none" stroke="#1e1e2e" strokeWidth="8" />
          {/* Fill */}
          <circle
            cx="60" cy="60" r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}80)`, transition: "stroke-dashoffset 0.6s ease, stroke 0.3s" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-mono" style={{ color }}>{pct}%</span>
          <span className="text-[9px] text-[#4a4a6a] uppercase tracking-wider">blast radius</span>
        </div>
      </div>
    </div>
  )
}
