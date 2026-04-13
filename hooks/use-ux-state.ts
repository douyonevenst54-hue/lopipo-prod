'use client'

import { useState, useEffect } from 'react'

interface UXState {
  showOnboarding: boolean
  showDailySpin: boolean
  currentStreak: number
  hasClaimedToday: boolean
  activeTab: 'home' | 'polls' | 'leaderboard' | 'profile'
}

export function useUXState() {
  const [state, setState] = useState<UXState>({
    showOnboarding: false,
    showDailySpin: false,
    currentStreak: 0,
    hasClaimedToday: false,
    activeTab: 'home',
  })

  // Load initial state
  useEffect(() => {
    const stored = localStorage.getItem('lopipo-ux-state')
    const onboarded = localStorage.getItem('lopipo-onboarded')

    if (stored) {
      setState(JSON.parse(stored))
    }

    // Show onboarding if first time
    if (!onboarded) {
      setState((prev) => ({ ...prev, showOnboarding: true }))
    }

    // Check if daily spin available
    const lastSpinDate = localStorage.getItem('lopipo-last-spin-date')
    const today = new Date().toDateString()

    if (lastSpinDate !== today) {
      setState((prev) => ({ ...prev, showDailySpin: true }))
    }
  }, [])

  // Persist state
  useEffect(() => {
    localStorage.setItem('lopipo-ux-state', JSON.stringify(state))
  }, [state])

  const completeOnboarding = () => {
    setState((prev) => ({ ...prev, showOnboarding: false }))
    localStorage.setItem('lopipo-onboarded', 'true')
  }

  const claimDailySpin = () => {
    const today = new Date().toDateString()
    setState((prev) => ({
      ...prev,
      showDailySpin: false,
      hasClaimedToday: true,
      currentStreak: prev.currentStreak + 1,
    }))
    localStorage.setItem('lopipo-last-spin-date', today)
  }

  const setActiveTab = (tab: UXState['activeTab']) => {
    setState((prev) => ({ ...prev, activeTab: tab }))
  }

  return {
    ...state,
    completeOnboarding,
    claimDailySpin,
    setActiveTab,
  }
}
