'use client'

import { useEffect, useState } from 'react'
import { Trophy, CheckCircle, Loader2 } from 'lucide-react'
import { DrawVerificationCard } from '@/components/draw-verification-card'

interface Draw {
  id: string
  winner: string
  piWon: number
  ticketCount: number
  prizePool: number
  drawnAt: string
  seed: string
  seedHash: string
}

export default function DrawHistoryPage() {
  const [draws, setDraws] = useState<Draw[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchDraws = async () => {
      try {
        const response = await fetch(`/api/draws/history?page=${page}&limit=10`)
        if (!response.ok) throw new Error('Failed to fetch draws')
        const data = await response.json()
        setDraws(data.draws || [])
      } catch (err) {
        console.log('[v0] Error fetching draws:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDraws()
  }, [page])

  return (
    <main className="min-h-screen bg-background font-sans">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <Trophy className="w-12 h-12 mx-auto text-amber-400 mb-4" />
          <h1 className="text-4xl font-bold text-foreground mb-2">Lottery Draw History</h1>
          <p className="text-muted-foreground">All draws are verified and immutable. See proof of our fairness.</p>
        </div>

        {/* Draws List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : draws.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No draws yet</div>
        ) : (
          <div className="space-y-4 mb-8">
            {draws.map((draw) => (
              <div key={draw.id} className="rounded-xl border border-border bg-card/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="font-bold text-foreground">{draw.winner}</p>
                      <p className="text-xs text-muted-foreground">{new Date(draw.drawnAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gradient">{draw.piWon}π</p>
                    <p className="text-xs text-muted-foreground">{draw.ticketCount} tickets</p>
                  </div>
                </div>
                
                <DrawVerificationCard draw={{ seed: draw.seed, seedHash: draw.seedHash, winner: draw.winner, ticketCount: draw.ticketCount, timestamp: draw.drawnAt }} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-muted-foreground">Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-lg border border-border hover:bg-muted"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  )
}
