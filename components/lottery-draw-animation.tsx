'use client'

import { useState, useEffect } from 'react'
import { Trophy, Sparkles } from 'lucide-react'

interface LotteryDrawAnimationProps {
  isOpen: boolean
  onClose: () => void
  participants: Array<{ id: string; name: string }>
  onComplete: (winner: { id: string; name: string }) => void
}

export function LotteryDrawAnimation({
  isOpen,
  onClose,
  participants,
  onComplete,
}: LotteryDrawAnimationProps) {
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<{ id: string; name: string } | null>(null)
  const [rotation, setRotation] = useState(0)
  const [countdown, setCountdown] = useState(3)

  // Countdown before spin
  useEffect(() => {
    if (!isOpen || spinning || winner) return

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }

    if (countdown === 0) {
      startSpin()
    }
  }, [countdown, isOpen, spinning, winner])

  const startSpin = () => {
    if (participants.length === 0) return

    setSpinning(true)
    
    // Select random winner
    const randomWinner = participants[Math.floor(Math.random() * participants.length)]
    
    // Calculate rotation (each participant gets a segment)
    const segmentDegrees = 360 / participants.length
    const winnerIndex = participants.indexOf(randomWinner)
    const targetRotation = 360 * 5 + (winnerIndex * segmentDegrees) + segmentDegrees / 2
    
    // Animate spin with deceleration
    setTimeout(() => {
      setRotation(targetRotation)
      
      // After animation completes, show winner
      setTimeout(() => {
        setWinner(randomWinner)
        setSpinning(false)
        setTimeout(() => onComplete(randomWinner), 2000)
      }, 3500)
    }, 100)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center gap-8 backdrop-blur-sm">
      {/* Countdown or Draw Title */}
      {!winner && !spinning && countdown > 0 && (
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-syne font-bold text-white">Lottery Draw Starting In</h2>
          <div className="text-7xl font-bold text-gradient animate-bounce">{countdown}</div>
        </div>
      )}

      {/* Spinning Wheel */}
      {!winner && (
        <div className="relative w-80 h-80 flex items-center justify-center">
          {/* Wheel */}
          <div
            className="w-80 h-80 rounded-full border-8 border-amber-400 flex items-center justify-center shadow-glow-gold transition-transform duration-[3500ms] ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: `conic-gradient(${participants
                .map((_, i) => {
                  const colors = ['#FFC107', '#FF6B9D', '#00D4FF', '#22C55E']
                  return colors[i % colors.length]
                })
                .join(',')})`,
            }}
          >
            {/* Participant names around wheel */}
            {participants.map((p, i) => {
              const angle = (360 / participants.length) * i
              const radians = (angle * Math.PI) / 180
              const x = Math.cos(radians) * 120
              const y = Math.sin(radians) * 120
              
              return (
                <div
                  key={p.id}
                  className="absolute text-xs font-bold text-white text-center w-20"
                  style={{
                    transform: `translate(${x}px, ${y}px) rotate(${angle + 90}deg)`,
                  }}
                >
                  {p.name.substring(0, 10)}
                </div>
              )
            })}
          </div>

          {/* Center indicator */}
          <div className="absolute w-12 h-12 rounded-full bg-gradient-gold shadow-glow-gold flex items-center justify-center">
            <Sparkles size={24} className="text-white animate-spin" />
          </div>

          {/* Pointer at top */}
          <div className="absolute top-0 w-0 h-0 border-l-6 border-r-6 border-t-12 border-l-transparent border-r-transparent border-t-red-500"></div>
        </div>
      )}

      {/* Winner Announcement */}
      {winner && (
        <div className="text-center space-y-6 animate-pulse">
          <div className="flex justify-center mb-4">
            <Trophy size={64} className="text-amber-400 animate-bounce" />
          </div>
          <h2 className="text-4xl font-syne font-bold text-white">Winner!</h2>
          <p className="text-5xl font-syne font-bold text-gradient">{winner.name}</p>
          <p className="text-2xl text-amber-300">Congratulations! Check your wallet for your Pi!</p>
        </div>
      )}

      {/* Close button */}
      {winner && (
        <button
          onClick={onClose}
          className="mt-8 px-8 py-3 rounded-xl bg-gradient-primary text-white font-bold hover:opacity-90 transition-opacity"
        >
          Close
        </button>
      )}
    </div>
  )
}
