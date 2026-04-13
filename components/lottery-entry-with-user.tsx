'use client'

import { usePiUser } from '@/hooks/use-pi-user'
import { useState } from 'react'

export function LotteryEntryWithUser({
  seriesId,
  onTicketBought,
}: {
  seriesId: string
  onTicketBought?: (userName: string, quantity: number) => void
}) {
  const { piUser, username } = usePiUser()
  const [quantity, setQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleBuyTickets = async () => {
    if (!piUser?.uid || !username) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/lottery/${seriesId}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: piUser.uid,
          userName: username,
          quantity,
        }),
      })

      if (!response.ok) throw new Error('Failed to buy tickets')

      onTicketBought?.(username, quantity)
    } catch (error) {
      console.error('[v0] Ticket purchase error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-card rounded-xl border border-border">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase">Entering as</p>
        <p className="text-sm font-bold text-foreground">{username || 'Loading...'}</p>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase">Tickets</label>
        <input
          type="number"
          min="1"
          max="50"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-16 px-2 py-1 text-xs rounded border border-border bg-background text-foreground"
        />
        <span className="text-xs text-muted-foreground ml-auto">{(quantity * 0.5).toFixed(2)} Pi</span>
      </div>

      <button
        onClick={handleBuyTickets}
        disabled={!piUser || isSubmitting}
        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-primary shadow-glow-primary hover:opacity-90 disabled:opacity-40 transition-opacity"
      >
        {isSubmitting ? 'Buying...' : 'Buy Tickets'}
      </button>
    </div>
  )
}
