'use client'

import { Wallet, TrendingUp, Trophy, User, Home } from 'lucide-react'

export type TabType = 'home' | 'polls' | 'leaderboard' | 'profile'

interface BottomNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const TABS = [
  { id: 'home', label: 'Lottery', icon: Home },
  { id: 'polls', label: 'Polls', icon: TrendingUp },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'profile', label: 'Profile', icon: User },
] as const

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-card to-card/80 backdrop-blur-lg border-t border-border/50 safe-area-inset-bottom z-40">
      <div className="flex items-center justify-around h-20 max-w-2xl mx-auto px-4">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange(id as TabType)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 relative group ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={label}
            >
              <div className="relative">
                <Icon
                  size={24}
                  className={`transition-transform duration-300 ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`}
                />
                {isActive && (
                  <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-20 blur-lg animate-pulse" />
                )}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 h-0.5 w-8 bg-gradient-primary rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
