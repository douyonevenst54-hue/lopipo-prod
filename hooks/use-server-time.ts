'use client'

import { useEffect, useState } from 'react'

interface TimeSync {
  serverTime: number
  clientTime: number
  offset: number
}

let timeSyncCache: TimeSync | null = null

/**
 * Fetches current server time from API
 * Calculates offset between server and client clocks
 * Used to prevent countdown timer manipulation via system clock changes
 */
export async function fetchServerTime(): Promise<TimeSync> {
  try {
    const clientTime = Date.now()
    
    const response = await fetch('/api/time/current', {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' }
    })

    if (!response.ok) throw new Error('Failed to fetch server time')
    
    const { timestamp } = await response.json()
    const serverTime = new Date(timestamp).getTime()
    
    const offset = serverTime - clientTime
    
    timeSyncCache = { serverTime, clientTime, offset }
    return timeSyncCache
  } catch (err) {
    console.error('[v0] Server time sync failed:', err)
    // Fallback to client time if server unavailable
    return { serverTime: Date.now(), clientTime: Date.now(), offset: 0 }
  }
}

/**
 * Hook: useServerTime
 * Returns accurate server-synced time, updates every second
 * Prevents browser clock manipulation for fair countdown
 */
export function useServerTime() {
  const [serverTime, setServerTime] = useState<number | null>(null)
  const [isSynced, setIsSynced] = useState(false)

  useEffect(() => {
    let mounted = true

    // Fetch server time on mount
    const syncTime = async () => {
      const sync = await fetchServerTime()
      if (mounted) {
        setServerTime(sync.serverTime)
        setIsSynced(true)
      }
    }

    syncTime()

    // Update every second using calculated offset
    const interval = setInterval(() => {
      if (timeSyncCache) {
        const elapsed = Date.now() - timeSyncCache.clientTime
        setServerTime(timeSyncCache.serverTime + elapsed)
      }
    }, 1000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  return { serverTime: serverTime || Date.now(), isSynced }
}

/**
 * Calculate remaining time until target date using server time
 * Safe from browser clock manipulation
 */
export function useCountdown(targetDate: Date | string | null) {
  const { serverTime, isSynced } = useServerTime()
  const [remaining, setRemaining] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    totalSeconds: number
    isExpired: boolean
  } | null>(null)

  useEffect(() => {
    if (!targetDate || !isSynced) return

    const target = new Date(targetDate).getTime()
    const now = serverTime
    const diff = Math.max(0, target - now)

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((diff / (1000 * 60)) % 60)
    const seconds = Math.floor((diff / 1000) % 60)
    const totalSeconds = Math.floor(diff / 1000)
    const isExpired = diff === 0

    setRemaining({
      days,
      hours,
      minutes,
      seconds,
      totalSeconds,
      isExpired
    })
  }, [serverTime, targetDate, isSynced])

  return remaining
}
