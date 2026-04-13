'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

interface DailyFreeSpinProps {
  open: boolean
  onClose: () => void
  onClaim: () => Promise<void>
  currentStreak: number
  hasClaimedToday: boolean
}

export function DailyFreeSpin({
  open,
  onClose,
  onClaim,
  currentStreak,
  hasClaimedToday,
}: DailyFreeSpinProps) {
  const [claiming, setClaiming] = useState(false)

  if (!open) return null

  const handleClaim = async () => {
    setClaiming(true)
    try {
      await onClaim()
      setTimeout(onClose, 1000)
    } catch (error) {
      console.error('[v0] Failed to claim daily spin:', error)
    } finally {
      setClaiming(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="glass-panel max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-6 text-center border-b border-amber-500/20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-gold mb-4">
            <Sparkles size={32} className="text-white animate-bounce" />
          </div>
          <h2 className="text-2xl font-syne font-bold text-foreground">Daily Free Spin</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Earn 0.001π every day!
          </p>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6">
          {/* Streak Display */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border">
            <div className="text-3xl">🔥</div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Current Streak</p>
              <p className="text-2xl font-bold text-foreground">{currentStreak} days</p>
            </div>
          </div>

          {/* Reward Highlight */}
          <div className="p-4 rounded-xl border border-amber-400/50 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
            <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Today's Reward</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-gradient">0.001</p>
              <p className="text-2xl font-bold text-amber-400">π</p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              {currentStreak > 1 && `Streak bonus: ${(0.001 * currentStreak * 0.1).toFixed(4)}π`}
            </p>
          </div>

          {/* Already Claimed */}
          {hasClaimedToday && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-sm font-semibold text-green-400">
                Already claimed today. Come back tomorrow to keep your streak!
              </p>
            </div>
          )}

          {/* Claim Button */}
          <button
            onClick={handleClaim}
            disabled={claiming || hasClaimedToday}
            className={`w-full px-4 py-3 rounded-lg font-bold text-white uppercase tracking-wider transition-all duration-300 ${
              hasClaimedToday
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : claiming
                ? 'bg-primary/50 opacity-75'
                : 'bg-gradient-gold hover:shadow-glow-gold'
            }`}
          >
            {claiming ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Claiming...
              </span>
            ) : hasClaimedToday ? (
              'Already Claimed Today'
            ) : (
              'Claim Free Spin'
            )}
          </button>

          {/* Benefits */}
          <div className="text-xs text-muted-foreground space-y-2 p-3 rounded-lg bg-muted/30">
            <p className="font-semibold text-foreground">What you get:</p>
            <ul className="space-y-1">
              <li>• 0.001π instantly in your wallet</li>
              <li>• 1 free lottery ticket</li>
              <li>• Keep your daily streak alive</li>
              <li>• Multiplier bonus at 7-day streak</li>
            </ul>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 border-t border-border text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          Later
        </button>
      </div>
    </div>
  )
}
