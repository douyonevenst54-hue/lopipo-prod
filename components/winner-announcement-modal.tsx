'use client'

import { useEffect, useState } from 'react'
import { Trophy, Share2 } from 'lucide-react'

interface WinnerAnnouncementProps {
  winner: string
  amount: number
  isCurrentUser: boolean
  onClose: () => void
}

export function WinnerAnnouncementModal({ winner, amount, isCurrentUser, onClose }: WinnerAnnouncementProps) {
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    // Play confetti animation for 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  const handleShare = async () => {
    const text = isCurrentUser 
      ? `I just won ${amount}π in the LoPiPo Lottery! 🎉`
      : `${winner} just won ${amount}π in the LoPiPo Lottery! Can you beat them?`
    
    try {
      if (navigator.share) {
        await navigator.share({ title: 'LoPiPo Lottery Result', text })
      } else {
        await navigator.clipboard.writeText(text)
      }
    } catch (err) {
      console.log('[v0] Share error:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-gold rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                animation: `fall ${2 + Math.random() * 2}s linear forwards`,
                delay: `${i * 0.05}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Trophy Drop Animation */}
      <style>{`
        @keyframes trophy-drop {
          0% { transform: translateY(-300px) rotate(-45deg); opacity: 0; }
          100% { transform: translateY(0) rotate(0deg); opacity: 1; }
        }
        @keyframes winner-scale {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        .trophy-animate { animation: trophy-drop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .winner-animate { animation: winner-scale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both; }
        @keyframes fall {
          to { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>

      {/* Main Card */}
      <div className="relative glass-panel max-w-md w-full rounded-3xl overflow-hidden text-center">
        {/* Trophy Icon */}
        <div className="trophy-animate pt-8">
          <Trophy className="w-24 h-24 mx-auto text-amber-400" />
        </div>

        {/* Winner Text */}
        <div className="px-6 py-8 space-y-4">
          <div className="winner-animate">
            {isCurrentUser ? (
              <>
                <h2 className="text-4xl font-bold text-gradient mb-2">YOU WON!</h2>
                <p className="text-sm text-muted-foreground">Congratulations on your victory</p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-foreground mb-2">Winner Announced</h2>
                <p className="text-xl font-bold text-primary">{winner}</p>
              </>
            )}
          </div>

          {/* Prize Amount */}
          <div className="py-6 px-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50">
            <p className="text-sm text-muted-foreground mb-2">Prize Won</p>
            <p className="text-5xl font-bold text-gradient">{amount}</p>
            <p className="text-2xl font-bold text-amber-400">π</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-gold hover:opacity-90"
            >
              <Share2 size={16} />
              Share
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-foreground border border-border bg-muted/50 hover:bg-muted"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
