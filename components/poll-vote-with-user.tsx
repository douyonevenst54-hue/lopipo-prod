'use client'

import { usePiUser } from '@/hooks/use-pi-user'
import { useState } from 'react'

export function PollVoteWithUser({
  pollId,
  options,
  onVoteSubmitted,
}: {
  pollId: string
  options: Array<{ id: number; label: string; emoji: string }>
  onVoteSubmitted?: (userName: string, optionId: number) => void
}) {
  const { piUser, username } = usePiUser()
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitVote = async () => {
    if (!piUser?.uid || !username || selectedOption === null) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/polls/${pollId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: piUser.uid,
          userName: username,
          optionId: selectedOption,
        }),
      })

      if (!response.ok) throw new Error('Failed to submit vote')

      onVoteSubmitted?.(username, selectedOption)
    } catch (error) {
      console.error('[v0] Vote submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-card rounded-xl border border-border">
      <p className="text-xs font-semibold text-muted-foreground uppercase">Voting as: {username || 'Loading...'}</p>

      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelectedOption(option.id)}
            className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
              selectedOption === option.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            <input
              type="radio"
              checked={selectedOption === option.id}
              onChange={() => setSelectedOption(option.id)}
              className="w-4 h-4"
            />
            <span className="text-sm">{option.emoji}</span>
            <span className="text-sm font-medium flex-1 text-left">{option.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmitVote}
        disabled={!piUser || selectedOption === null || isSubmitting}
        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-primary shadow-glow-primary hover:opacity-90 disabled:opacity-40 transition-opacity"
      >
        {isSubmitting ? 'Submitting...' : 'Cast Vote'}
      </button>
    </div>
  )
}
