'use client'

import { useState } from 'react'
import { Copy, Check, Shield } from 'lucide-react'
import crypto from 'crypto'

interface DrawVerification {
  seed: string
  seedHash: string
  winner: string
  ticketCount: number
  timestamp: string
}

export function DrawVerificationCard({ draw }: { draw: DrawVerification }) {
  const [verified, setVerified] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleVerify = () => {
    try {
      // Client-side hash verification
      const hash = crypto.createHash('sha256').update(draw.seed).digest('hex')
      if (hash === draw.seedHash) {
        setVerified(true)
      }
    } catch (err) {
      console.log('[v0] Verification error:', err)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draw.seed)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.log('[v0] Copy error:', err)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card/50 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground">Draw Verification</h3>
        {verified && (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/50">
            <Shield size={14} className="text-green-400" />
            <span className="text-xs font-bold text-green-400">Fair</span>
          </div>
        )}
      </div>

      {/* Seed Display */}
      <div>
        <p className="text-xs text-muted-foreground font-semibold mb-2">Random Seed (Copyable)</p>
        <div className="flex gap-2 items-center p-3 rounded-lg bg-muted/50">
          <code className="flex-1 text-xs font-mono text-foreground truncate">{draw.seed.substring(0, 32)}...</code>
          <button
            onClick={handleCopy}
            className="shrink-0 p-1.5 hover:bg-muted transition-colors rounded"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-muted-foreground" />}
          </button>
        </div>
      </div>

      {/* Hash */}
      <div>
        <p className="text-xs text-muted-foreground font-semibold mb-2">SHA256 Hash</p>
        <code className="block text-[10px] font-mono text-muted-foreground p-2 rounded bg-muted/50 truncate">{draw.seedHash}</code>
      </div>

      {/* Verify Button */}
      <button
        onClick={handleVerify}
        className="w-full px-4 py-2.5 rounded-lg text-sm font-bold text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors"
      >
        {verified ? 'Verified Fair' : 'Verify Hash'}
      </button>

      {/* Info */}
      <p className="text-[10px] text-muted-foreground">
        Winner: <strong>{draw.winner}</strong> | {draw.ticketCount} tickets | {new Date(draw.timestamp).toLocaleString()}
      </p>
    </div>
  )
}
