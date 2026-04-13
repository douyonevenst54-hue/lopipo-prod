'use client'

import { useState, useEffect } from 'react'
import { usePiNetworkAuthentication } from './use-pi-network-authentication'

export interface PiUser {
  uid: string
  username: string
  referralCode?: string
  wallet?: string
  createdAt?: string
}

export const usePiUser = () => {
  const { isAuthenticated, piAccessToken } = usePiNetworkAuthentication()
  const [piUser, setPiUser] = useState<PiUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !piAccessToken) {
      setIsLoading(false)
      return
    }

    const initializeUser = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch user data from Pi Bridge SDK (this is a placeholder — in real Pi Browser it comes from Pi.Me.getVerifiedUser)
        const userData: PiUser = {
          uid: piAccessToken.split(':')[0] || `user-${Date.now()}`,
          username: localStorage.getItem('pi_username') || `user_${Math.random().toString(36).slice(2, 9)}`,
          wallet: piAccessToken,
        }

        // Save user to database on first auth
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            piUsername: userData.username,
            uid: userData.uid,
            wallet: userData.wallet,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to persist user to database')
        }

        const result = await response.json()
        setPiUser({
          ...userData,
          referralCode: result.user?.referral_code,
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize user'
        setError(message)
        console.error('[v0] User init error:', message)
      } finally {
        setIsLoading(false)
      }
    }

    initializeUser()
  }, [isAuthenticated, piAccessToken])

  return {
    piUser,
    isLoading,
    error,
    isAuthenticated,
    uid: piUser?.uid,
    username: piUser?.username,
    referralCode: piUser?.referralCode,
  }
}
