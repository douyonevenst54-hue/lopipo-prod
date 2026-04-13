export function getOnboardingStatus(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('lopipo_onboarded') === 'true'
}

export function setOnboardingComplete(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lopipo_onboarded', 'true')
  }
}

export function getDailySpinStatus(): { spunToday: boolean; lastSpinDate: string } {
  if (typeof window === 'undefined') return { spunToday: false, lastSpinDate: '' }
  const lastSpun = localStorage.getItem('lopipo_last_spin_date')
  const today = new Date().toISOString().split('T')[0]
  return {
    spunToday: lastSpun === today,
    lastSpinDate: lastSpun || '',
  }
}

export function setDailySpinUsed(): void {
  if (typeof window !== 'undefined') {
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem('lopipo_last_spin_date', today)
  }
}

export function getDailyStreak(): { current: number; lastDay: string } {
  if (typeof window === 'undefined') return { current: 0, lastDay: '' }
  const streak = parseInt(localStorage.getItem('lopipo_daily_streak') || '0', 10)
  const lastDay = localStorage.getItem('lopipo_streak_last_day') || ''
  return { current: streak, lastDay }
}

export function updateDailyStreak(): number {
  if (typeof window === 'undefined') return 0
  
  const today = new Date().toISOString().split('T')[0]
  const { current, lastDay } = getDailyStreak()
  
  // If spun yesterday, increment streak. Otherwise, reset to 1
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const newStreak = lastDay === yesterday ? current + 1 : 1
  
  localStorage.setItem('lopipo_daily_streak', newStreak.toString())
  localStorage.setItem('lopipo_streak_last_day', today)
  
  return newStreak
}
