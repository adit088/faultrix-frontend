"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import SplashScreen from "@/components/SplashScreen"

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const seen = sessionStorage.getItem("fx_splash_seen")
    if (seen) {
      // Already seen splash — check session status server-side and redirect accordingly.
      // We check /api/auth/session (which reads the HttpOnly cookie) instead of
      // localStorage to determine if the user is logged in.
      fetch("/api/auth/session")
        .then(res => {
          router.replace(res.ok ? "/dashboard" : "/register")
        })
        .catch(() => {
          router.replace("/register")
        })
    }
  }, [router])

  const handleSplashDone = async () => {
    sessionStorage.setItem("fx_splash_seen", "1")
    setShowSplash(false)

    try {
      const res = await fetch("/api/auth/session")
      router.replace(res.ok ? "/dashboard" : "/register")
    } catch {
      router.replace("/register")
    }
  }

  if (!showSplash) return null
  return <SplashScreen onDone={handleSplashDone} />
}