'use client'

import type React from 'react'
import { useState, useCallback, useEffect } from 'react'
import { Shuffle, Loader2, Vote, TrendingUp, Share2, Copy, Check, User } from 'lucide-react'
import { useChatbot } from '@/hooks/use-chatbot'
import { useUserData } from '@/hooks/use-user-data'
import { usePushNotifications } from '@/hooks/use-push-notifications'
import { usePiUser } from '@/hooks/use-pi-user'
import { APP_CONFIG } from '@/lib/app-config'
import { TopicMenu } from '@/components/topic-menu'
import { LotteryPanel } from '@/components/lottery-panel'
import { LottoPanel } from '@/components/lotto-panel'
import { LivePollPanel, isSportsTopic, type LivePoll } from '@/components/live-poll-panel'
import { TrendingPolls } from '@/components/trending-polls'
import { DevLotteryBanner } from '@/components/dev-lottery-banner'
import { ReferralBanner } from '@/components/referral-banner'
import { AdBanner } from '@/components/ad-banner'
import { BottomNavigation, type TabType } from '@/components/bottom-navigation'
import { OnboardingFlow } from '@/components/onboarding-flow'
import { DailyFreeSpin } from '@/components/daily-free-spin'
import { DailyStreakIndicator } from '@/components/daily-streak-indicator'
import { Leaderboard } from '@/components/leaderboard'
import { useUXState } from '@/hooks/use-ux-state'

const EXAMPLE_TOPICS = [
  { label: '🍕 Pizza Toppings', value: 'pizza toppings', sport: false },
  { label: '🌍 Travel Destinations', value: 'travel destinations', sport: false },
  { label: '🎬 Movie Genres', value: 'movie genres', sport: false },
  { label: '🏀 NBA Teams', value: 'best NBA teams of all time', sport: true },
  { label: '⚽ Premier League', value: 'best Premier League teams', sport: true },
  { label: '🏈 NFL Playoffs', value: 'NFL playoff contenders this season', sport: true },
  { label: '🎮 Video Games', value: 'classic video game characters', sport: false },
  { label: '🍦 Ice Cream Flavors', value: 'ice cream flavors', sport: false },
]

const COUNT_OPTIONS = [4, 6, 8, 10]

const RESULT_COLORS = [
  { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' },
  { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
  { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
  { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700' },
  { bg: 'bg-orange-50/70', border: 'border-orange-100', badge: 'bg-orange-200 text-orange-800' },
  { bg: 'bg-amber-50/70', border: 'border-amber-100', badge: 'bg-amber-200 text-amber-800' },
  { bg: 'bg-red-50/70', border: 'border-red-100', badge: 'bg-red-200 text-red-800' },
  { bg: 'bg-yellow-50/70', border: 'border-yellow-100', badge: 'bg-yellow-200 text-yellow-800' },
]

interface ResultItem {
  id: number
  label: string
  emoji: string
  description: string
}

function LotteryContent({ topic, count, results, generating, currentTopic, handleGenerate, handleShareGame, isSports, shareSuccess, setPollOpen, setTopic, setCount, EXAMPLE_TOPICS, COUNT_OPTIONS, RESULT_COLORS, username, referralCode, referralEarnings, setProfileOpen, userProfile, handleMenuSelect, handleKeyDown, parseError, generateError }: any) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-8 relative pb-24">
      {/* Hero */}
      <section className="text-center flex flex-col gap-2">
        <h1 className="text-4xl font-syne font-bold text-gradient text-balance leading-tight">Generate your game instantly</h1>
        <p className="text-muted-foreground text-base leading-relaxed">Pick a topic, choose how many options, and let the AI do the magic.</p>
      </section>

      {/* Referral Banner */}
      <ReferralBanner referralCode={referralCode} referralEarnings={referralEarnings} />

      {/* Generator Card */}
      <section className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">Topic</label>
          <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type any topic" disabled={generating} className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow disabled:opacity-50" />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quick picks</span>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_TOPICS.map((t: any) => (
              <button key={t.value} onClick={() => setTopic(t.value)} disabled={generating} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${topic === t.value ? 'bg-gradient-primary text-white shadow-glow-primary' : 'bg-muted text-muted-foreground hover:bg-primary/10'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">Number of options</span>
          <div className="flex gap-2">
            {COUNT_OPTIONS.map((n) => (
              <button key={n} onClick={() => setCount(n)} disabled={generating} className={`w-12 h-10 rounded-xl text-sm font-bold border transition-all ${count === n ? 'bg-gradient-primary text-white shadow-glow-primary' : 'bg-muted text-muted-foreground'}`}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleGenerate} disabled={generating} className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 bg-gradient-primary shadow-glow-primary">
          {generating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Shuffle size={16} />
              Generate Game
            </>
          )}
        </button>
      </section>

      {/* Ad Banner */}
      <AdBanner />

      {/* Trending Polls */}
      <TrendingPolls polls={[]} onVote={() => {}} />

      {/* Official Lottery */}
      <DevLotteryBanner />

      {/* Results */}
      {results.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-syne font-bold text-foreground">{currentTopic}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.map((item, idx) => {
              const color = RESULT_COLORS[idx % RESULT_COLORS.length]
              return (
                <div key={item.id} className={`flex gap-3 rounded-2xl border p-4 ${color.bg} ${color.border}`}>
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-semibold text-foreground text-sm">{item.label}</span>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

function PollsContent() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-8 relative pb-24">
      <h2 className="text-2xl font-syne font-bold text-foreground">Trending Polls</h2>
      <TrendingPolls polls={[]} onVote={() => {}} />
    </div>
  )
}

function LeaderboardContent() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-8 relative pb-24">
      <h2 className="text-2xl font-syne font-bold text-foreground">Weekly Winners</h2>
      <Leaderboard />
    </div>
  )
}

function ProfileContent({ username, uid, userProfile, referralCode, referralEarnings }: any) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-8 relative pb-24">
      <h2 className="text-2xl font-syne font-bold text-foreground">Profile</h2>
      {username && (
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-foreground">{username}</p>
              <p className="text-xs text-muted-foreground font-mono">{uid?.slice(0, 12)}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Polls Created</span><span className="font-bold">{userProfile?.pollsCreated ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Lotteries</span><span className="font-bold">{userProfile?.lotteriesEntered ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Pi Won</span><span className="font-bold text-primary">{userProfile?.piWon ?? 0}</span></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LoPiPo() {
  const { isAuthenticated, authMessage, error } = useChatbot()
  const { userProfile, referralCode, referralEarnings, refreshProfile } = useUserData()
  const { subscribeToNotifications } = usePushNotifications()
  const { username, uid } = usePiUser()
  const uxState = useUXState()

  const [topic, setTopic] = useState('')
  const [count, setCount] = useState(6)
  const [results, setResults] = useState<ResultItem[]>([])
  const [generating, setGenerating] = useState(false)
  const [currentTopic, setCurrentTopic] = useState('')
  const [parseError, setParseError] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    subscribeToNotifications()
    refreshProfile()
  }, [subscribeToNotifications, refreshProfile])

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center gap-4">
        <div className="text-3xl font-syne font-bold text-gradient">{APP_CONFIG.NAME}</div>
        <div className={`text-base ${error ? 'text-destructive' : 'text-muted-foreground'}`}>{authMessage}</div>
        {!error && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />}
        {error && <button className="mt-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-primary" onClick={() => window.location.reload()}>Retry</button>}
      </div>
    )
  }

  if (!mounted) return null

  const handleGenerate = async () => {
    // Placeholder
  }

  const handleShareGame = async () => {
    setShareSuccess(true)
    setTimeout(() => setShareSuccess(false), 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleGenerate()
  }

  const handleMenuSelect = (value: string) => {
    setTopic(value)
  }

  const isSports = isSportsTopic(currentTopic)

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <h1 className="text-lg font-syne font-bold text-gradient">{APP_CONFIG.NAME}</h1>
        {uxState.currentStreak > 0 && <DailyStreakIndicator streak={uxState.currentStreak} hasClaimedToday={uxState.hasClaimedToday} />}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {uxState.activeTab === 'home' && <LotteryContent topic={topic} count={count} results={results} generating={generating} currentTopic={currentTopic} handleGenerate={handleGenerate} handleShareGame={handleShareGame} isSports={isSports} shareSuccess={shareSuccess} setPollOpen={() => {}} setTopic={setTopic} setCount={setCount} EXAMPLE_TOPICS={EXAMPLE_TOPICS} COUNT_OPTIONS={COUNT_OPTIONS} RESULT_COLORS={RESULT_COLORS} username={username} referralCode={referralCode} referralEarnings={referralEarnings} setProfileOpen={() => {}} userProfile={userProfile} handleMenuSelect={handleMenuSelect} handleKeyDown={handleKeyDown} parseError={parseError} generateError={generateError} />}
        {uxState.activeTab === 'polls' && <PollsContent />}
        {uxState.activeTab === 'leaderboard' && <LeaderboardContent />}
        {uxState.activeTab === 'profile' && <ProfileContent username={username} uid={uid} userProfile={userProfile} referralCode={referralCode} referralEarnings={referralEarnings} />}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={uxState.activeTab} onTabChange={uxState.setActiveTab} />

      {/* Modals */}
      <OnboardingFlow open={uxState.showOnboarding} onComplete={uxState.completeOnboarding} />
      <DailyFreeSpin open={uxState.showDailySpin} onClose={() => {}} onClaim={async () => { uxState.claimDailySpin() }} currentStreak={uxState.currentStreak} hasClaimedToday={uxState.hasClaimedToday} />
    </div>
  )
}
