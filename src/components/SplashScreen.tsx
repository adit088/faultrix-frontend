"use client"
import { useEffect, useState } from "react"

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [isRevealed, setIsRevealed] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Phase 1: Quick Reveal
    const revealTimer = setTimeout(() => setIsRevealed(true), 100)
    
    // Phase 2: Start Exit (Fast timing for better UX)
    const exitTimer = setTimeout(() => setIsExiting(true), 1400)
    
    // Phase 3: Unmount
    const doneTimer = setTimeout(onDone, 2000)

    return () => {
      clearTimeout(revealTimer)
      clearTimeout(exitTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone])

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#000] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isExiting ? "opacity-0 scale-95 blur-md" : "opacity-100"
      }`}
    >
      {/* Subtlest background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black" />

      <div className="relative flex flex-col items-center">
        
        {/* Modern Geometric Icon */}
        <div className={`mb-8 transition-all duration-1000 ease-out ${
          isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          <div className="relative w-12 h-12 sm:w-16 sm:h-16">
            {/* The "F" Core */}
            <div className="absolute inset-0 border-[1.5px] border-white/20 rounded-full" />
            <div className="absolute inset-0 border-t-[1.5px] border-white rounded-full animate-[spin_3s_linear_infinite]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-light text-xl sm:text-2xl tracking-tighter">F</span>
            </div>
          </div>
        </div>

        {/* Wordmark with Mask Reveal */}
        <div className="overflow-hidden">
          <h1 
            className={`text-white font-medium tracking-[0.3em] sm:tracking-[0.5em] uppercase transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isRevealed ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            }`}
            style={{ fontSize: "clamp(1.5rem, 6vw, 2.5rem)" }}
          >
            Faultrix
          </h1>
        </div>

        {/* Animated Progress Accent */}
        <div className="mt-6 w-32 sm:w-48 h-[1px] bg-white/10 relative overflow-hidden">
          <div 
            className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transition-transform duration-[1500ms] ease-in-out ${
              isRevealed ? "translate-x-full" : "-translate-x-full"
            }`} 
          />
        </div>

        {/* Tagline */}
        <div className="overflow-hidden mt-4">
          <p className={`text-[10px] sm:text-xs font-light text-zinc-500 tracking-[0.4em] uppercase transition-all duration-1000 delay-300 ${
            isRevealed ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
          }`}>
            Chaos Engineering
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}