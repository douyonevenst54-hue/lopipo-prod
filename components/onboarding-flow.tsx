'use client'

import { useState } from 'react'
import { ChevronRight, Zap, Trophy, Wallet } from 'lucide-react'

interface OnboardingFlowProps {
  open: boolean
  onComplete: () => void
}

export function OnboardingFlow({ open, onComplete }: OnboardingFlowProps) {
  const [slide, setSlide] = useState(0)

  if (!open) return null

  const slides = [
    {
      title: 'Welcome to LoPiPo',
      description: 'Turn any topic into an instant lottery or poll. Perfect for settling debates and making group decisions.',
      icon: Zap,
      color: 'text-primary',
    },
    {
      title: 'Spin to Win',
      description: 'Play the daily lottery wheel, vote on trending polls, or create your own game. Win real Pi Network rewards.',
      icon: Trophy,
      color: 'text-amber-400',
    },
    {
      title: 'Connect Your Wallet',
      description: 'Link your Pi account to start playing for real. Your first spin is free—no deposit needed.',
      icon: Wallet,
      color: 'text-green-400',
    },
  ]

  const current = slides[slide]
  const Icon = current.icon
  const isLast = slide === slides.length - 1

  const handleNext = () => {
    if (isLast) {
      onComplete()
    } else {
      setSlide(slide + 1)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="glass-panel max-w-sm w-full">
        {/* Progress Indicator */}
        <div className="flex gap-1 p-4 border-b border-border">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                idx <= slide ? 'bg-gradient-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-8 text-center flex flex-col items-center gap-6">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted">
            <Icon size={40} className={current.color} />
          </div>

          {/* Text */}
          <div className="space-y-3">
            <h2 className="text-2xl font-syne font-bold text-foreground text-balance">
              {current.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed text-balance">
              {current.description}
            </p>
          </div>

          {/* Slide Counter */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {slide + 1} of {slides.length}
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-3">
          {/* Primary CTA */}
          <button
            onClick={handleNext}
            className="w-full px-4 py-3 rounded-lg bg-gradient-primary text-white font-bold uppercase tracking-wider text-sm transition-all duration-300 hover:shadow-glow-primary flex items-center justify-center gap-2"
          >
            {isLast ? 'Get Started' : 'Next'}
            <ChevronRight size={16} />
          </button>

          {/* Skip CTA */}
          {!isLast && (
            <button
              onClick={onComplete}
              className="w-full px-4 py-2 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
