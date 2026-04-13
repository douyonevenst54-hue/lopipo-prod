"use client"

import { useState, useEffect, useCallback } from "react"

interface User {
  id: string
  uid: string
  pi_username: string
  referral_code: string
  referred_by: string | null
}

interface ReferralData {
  referralCode: string
  referralCount: number
  totalRewards: number
}

export function useUserData(uid: string | null) {
  const [user, setUser] = useState<User | null>(null)
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize user on first login
  const initializeUser = useCallback(async (piUid: string, piUsername: string, wallet?: string) => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: piUid, piUsername, wallet }),
      })
      if (!res.ok) throw new Error("Failed to initialize user")
      const data = await res.json()
      setUser(data.user)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch user profile
  const fetchProfile = useCallback(async (piUid: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/profile/${piUid}`)
      if (!res.ok) throw new Error("Failed to fetch profile")
      const data = await res.json()
      setUser(data.user)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch referral info
  const fetchReferralData = useCallback(async (piUid: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/referral?uid=${piUid}`)
      if (!res.ok) throw new Error("Failed to fetch referral data")
      const data = await res.json()
      setReferralData(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  // Track referral code from URL
  const trackReferral = useCallback(async (piUid: string, referralCode: string) => {
    try {
      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: piUid, referralCode }),
      })
      if (res.ok) {
        console.log("[v0] Referral tracked successfully")
      }
    } catch (err) {
      console.error("[v0] Track referral error:", err)
    }
  }, [])

  return {
    user,
    referralData,
    loading,
    error,
    initializeUser,
    fetchProfile,
    fetchReferralData,
    trackReferral,
  }
}
