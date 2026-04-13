'use client'

import { useState, useEffect } from 'react'
import { BottomNavigation, type TabType } from '@/components/bottom-navigation'
import { OnboardingFlow } from '@/components/onboarding-flow'
import { DailyFreeSpin } from '@/components/daily-free-spin'
import { DailyStreakIndicator } from '@/components/daily-streak-indicator'
import { Leaderboard } from '@/components/leaderboard'
import { useUXState } from '@/hooks/use-ux-state'
import { usePiUser } from '@/hooks/use-pi-user'

// Import the existing components from current page
import { LotteryPanel } from '@/components/lottery-panel'
import { LottoPanel } from '@/components/lotto-panel'
import { TrendingPolls } from '@/components/trending-polls'
import { ReferralBanner } from '@/components/referral-banner'
import { AdBanner } from '@/components/ad-banner'

interface TabLayoutProps {
  children: React.ReactNode // The existing lottery/poll content
}

export function TabLayout({ children }: TabLayoutProps) {
  const uxState = useUXState()
  const { username, uid } = usePiUser()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const renderTabContent = () => {
    switch (uxState.activeTab) {
      case 'home':
        // Lottery screen with existing content
        return (
          <div className="flex-1 overflow-y-auto pb-24">
            {children}
          </div>
        )

      case 'polls':
        // Polls/Community screen
        return (
          <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-syne font-bold text-foreground mb-4">Trending Polls</h2>
                <TrendingPolls polls={[]} onVote={() => {}} />
              </div>
            </div>
          </div>
        )

      case 'leaderboard':
        // Leaderboard screen
        return (
          <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-syne font-bold text-foreground mb-4">Winners</h2>
                <Leaderboard />
              </div>
            </div>
          </div>
        )

      case 'profile':
        // Profile screen
        return (
          <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-syne font-bold text-foreground mb-4">Profile</h2>
                {username && (
                  <div className="glass-panel p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-lg">
                        {username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{username}</p>
                        <p className="text-xs text-muted-foreground font-mono">{uid}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-border space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Referral Code</span>
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {uid?.slice(0, 8)}
                        </code>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Daily Streak</span>
                        <span className="text-sm font-bold text-primary">{uxState.currentStreak} days</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
        <h1 className="text-lg font-syne font-bold text-foreground">LoPiPo</h1>
        {uxState.currentStreak > 0 && (
          <DailyStreakIndicator
            streak={uxState.currentStreak}
            hasClaimedToday={uxState.hasClaimedToday}
          />
        )}
      </header>

      {/* Content */}
      {renderTabContent()}

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={uxState.activeTab}
        onTabChange={uxState.setActiveTab}
      />

      {/* Modals */}
      <OnboardingFlow
        open={uxState.showOnboarding}
        onComplete={uxState.completeOnboarding}
      />

      <DailyFreeSpin
        open={uxState.showDailySpin}
        onClose={() => {
          // Don't show daily spin modal (will claim via API)
        }}
        onClaim={async () => {
          try {
            const response = await fetch('/api/daily-spin', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ uid }),
            })
            if (response.ok) {
              uxState.claimDailySpin()
            }
          } catch (error) {
            console.error('[v0] Failed to claim daily spin:', error)
          }
        }}
        currentStreak={uxState.currentStreak}
        hasClaimedToday={uxState.hasClaimedToday}
      />
    </div>
  )
}
