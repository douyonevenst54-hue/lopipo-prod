"use client"

import { useEffect, useState } from "react"
import { WifiOff, Wifi } from "lucide-react"

export function OfflineDetectionBanner() {
  const [isOnline, setIsOnline] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Set initial state
    setIsOnline(navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      console.log("[v0] Back online")
    }

    const handleOffline = () => {
      setIsOnline(false)
      console.log("[v0] Connection lost")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!mounted || isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-500 to-orange-500 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <WifiOff size={20} className="text-white shrink-0" />
          <div>
            <p className="font-semibold text-white">No internet connection</p>
            <p className="text-sm text-white/80">Some features may not work properly</p>
          </div>
        </div>
        <Wifi size={20} className="text-white/40 shrink-0" />
      </div>
    </div>
  )
}
