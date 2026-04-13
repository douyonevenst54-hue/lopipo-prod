'use client'

import { useEffect, useState } from 'react'
import { Trophy, Medal, Flame, TrendingUp, Loader2, Star } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  username: string
  piWon: number
  tickets: number
  avatar?: string
}

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard')
        if (!response.ok) throw new Error('Failed to fetch leaderboard')
        const data = await response.json()
        setEntries(data.leaderboard || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading leaderboard')
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const getBadge = (rank: number) => {
    if (rank === 1) return { icon: <Trophy size={24} />, bg: 'bg-gradient-gold', glow: 'shadow-glow-gold' }
    if (rank === 2) return { icon: <Medal size={24} />, bg: 'bg-gradient-blue', glow: 'shadow-glow-blue' }
    if (rank === 3) return { icon: <Medal size={24} />, bg: 'bg-gradient-green', glow: 'shadow-glow-green' }
    return { icon: null, bg: 'bg-muted', glow: '' }
  }

  const getRowBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-amber-500/15 to-transparent border-l-4 border-amber-400 hover:from-amber-500/25'
    if (rank === 2) return 'bg-gradient-to-r from-blue-500/15 to-transparent border-l-4 border-blue-400 hover:from-blue-500/25'
    if (rank === 3) return 'bg-gradient-to-r from-green-500/15 to-transparent border-l-4 border-green-400 hover:from-green-500/25'
    return 'border-b border-border/50 hover:bg-muted/30'
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 size={28} className="animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading leaderboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/30">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="p-8 text-center space-y-3">
        <Trophy size={40} className="mx-auto text-muted-foreground opacity-40" />
        <div>
          <p className="text-foreground font-bold">No winners yet this week</p>
          <p className="text-xs text-muted-foreground mt-1">Be the first to claim the throne!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Title and Info */}
      <div className="rounded-xl border border-border/50 bg-gradient-to-br from-primary/10 to-background p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
              <Trophy size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Top Winners</h3>
              <p className="text-xs text-muted-foreground">This week's champions</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-muted-foreground">🔥 Hot Streak</p>
            <p className="text-sm font-bold text-primary">+{entries[0]?.tickets || 0} entries</p>
          </div>
        </div>
        
        {/* Info Bar */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <TrendingUp size={12} />
            Updates hourly
          </span>
          <span>Your rank updates as you play</span>
        </div>
      </div>

      {/* Leaderboard Entries */}
      <div className="space-y-2">
        {entries.map((entry, index) => {
          const badge = getBadge(entry.rank)
          const rowBg = getRowBg(entry.rank)
          
          return (
            <div
              key={`${entry.rank}-${entry.username}`}
              className={`rounded-xl p-4 flex items-center gap-4 transition-all duration-200 ${rowBg}`}
            >
              {/* Rank Badge */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 text-white font-bold ${badge.bg} ${badge.glow}`}>
                {badge.icon ? (
                  badge.icon
                ) : (
                  <span className="text-sm">#{entry.rank}</span>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground truncate">{entry.username}</p>
                  {entry.rank <= 3 && <Star size={12} className="text-amber-400 shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground">{entry.tickets} tickets • {entry.piWon}π</p>
              </div>

              {/* Pi Won (Large) */}
              <div className="text-right shrink-0 flex flex-col items-end gap-1">
                <p className="text-xl font-bold text-gradient">{entry.piWon}</p>
                <p className="text-[10px] text-muted-foreground font-semibold">π won</p>
              </div>

              {/* Motivation for top spot */}
              {entry.rank === 1 && (
                <div className="absolute -top-2 -right-2 px-2 py-1 rounded-full bg-amber-400 text-[8px] font-bold text-black">
                  👑 LEAD
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Motivational Footer */}
      <div className="p-4 rounded-xl border border-border/50 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-center space-y-2">
        <p className="text-sm font-bold text-foreground">
          Your name could be next! 🚀
        </p>
        <p className="text-xs text-muted-foreground">
          Play more, share your referral link, and climb the ranks this week.
        </p>
      </div>
    </div>
  )
}
