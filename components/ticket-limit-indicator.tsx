'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, TicketCheck, TrendingUp } from 'lucide-react'

interface TicketLimitProps {
  userId?: string
  seriesId: string
  maxLimit?: number
  onLimitCheck?: (remaining: number, isLimited: boolean) => void
}

export function TicketLimitIndicator({
  userId,
  seriesId,
  maxLimit = 20,
  onLimitCheck
}: TicketLimitProps) {
  const [userTickets, setUserTickets] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchUserTickets = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/lottery/${seriesId}/user-tickets?userId=${userId}`)
        if (!response.ok) throw new Error('Failed to fetch tickets')
        
        const { count } = await response.json()
        setUserTickets(count || 0)
        
        const remaining = maxLimit - (count || 0)
        const isLimited = count >= maxLimit
        onLimitCheck?.(remaining, isLimited)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserTickets()
  }, [userId, seriesId, maxLimit, onLimitCheck])

  const remaining = maxLimit - userTickets
  const percentage = (userTickets / maxLimit) * 100

  if (!userId) return null
  if (loading) return <div className="text-sm text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TicketCheck size={16} className="text-primary" />
          <span className="text-sm font-semibold text-foreground">Your Tickets</span>
        </div>
        <span className="text-sm font-bold text-primary">{userTickets} / {maxLimit}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            percentage >= 100 ? 'bg-red-500' :
            percentage >= 75 ? 'bg-amber-500' :
            'bg-gradient-primary'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Info text */}
      {remaining > 0 ? (
        <p className="text-xs text-muted-foreground">
          You can buy {remaining} more ticket{remaining !== 1 ? 's' : ''} in this draw
        </p>
      ) : (
        <div className="flex items-start gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30">
          <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">
            You've reached the max {maxLimit} tickets per draw. Fair for all players!
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs text-amber-500">Error: {error}</p>
      )}
    </div>
  )
}
