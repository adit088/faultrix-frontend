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
      router.replace("/dashboard")
    }
  }, [router])

  const handleSplashDone = () => {
    sessionStorage.setItem("fx_splash_seen", "1")
    setShowSplash(false)
    router.replace("/dashboard")
  }

  if (!showSplash) return null

  return <SplashScreen onDone={handleSplashDone} />
}