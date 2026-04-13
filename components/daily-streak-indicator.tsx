'use client'

interface DailyStreakIndicatorProps {
  streak: number
  hasClaimedToday: boolean
}

export function DailyStreakIndicator({
  streak,
  hasClaimedToday,
}: DailyStreakIndicatorProps) {
  if (streak === 0) return null

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
      <span className="text-lg">🔥</span>
      <span className="text-xs font-bold text-amber-400">{streak} day{streak !== 1 ? 's' : ''}</span>
      {hasClaimedToday && (
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      )}
    </div>
  )
}
