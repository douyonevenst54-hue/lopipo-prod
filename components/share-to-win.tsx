'use client'

import { useState } from 'react'
import { Share2, Copy, Check, Loader2 } from 'lucide-react'

interface ShareToWinProps {
  referralLink: string
  onShare: () => Promise<void>
}

export function ShareToWin({ referralLink, onShare }: ShareToWinProps) {
  const [copied, setCopied] = useState(false)
  const [sharing, setSharing] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('[v0] Copy failed:', error)
    }
  }

  const handleShare = async () => {
    setSharing(true)
    try {
      await onShare()

      if (navigator.share) {
        await navigator.share({
          title: 'Join LoPiPo on Pi Network',
          text: 'Spin the lottery wheel and win real Pi! Click my link to get bonus entries.',
          url: referralLink,
        })
      }
    } catch (error) {
      console.error('[v0] Share failed:', error)
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="glass-panel p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Share2 size={16} className="text-primary" />
        <h3 className="font-bold text-foreground text-sm">Share to Win</h3>
      </div>

      {/* Link Display */}
      <div className="p-3 rounded-lg bg-muted/50 border border-border flex items-center gap-2 group">
        <input
          type="text"
          value={referralLink}
          readOnly
          className="flex-1 bg-transparent text-xs font-mono text-muted-foreground outline-none truncate"
        />
        <button
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          title="Copy link"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
      </div>

      {/* CTA Buttons */}
      <div className="flex gap-2">
        {/* Share Native */}
        {typeof navigator !== 'undefined' && navigator.share && (
          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex-1 px-3 py-2 rounded-lg bg-gradient-blue text-white text-sm font-bold uppercase tracking-wider transition-all duration-300 hover:shadow-glow-blue disabled:opacity-50 flex items-center justify-center gap-1"
          >
            {sharing ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Share2 size={12} />
                Share
              </>
            )}
          </button>
        )}

        {/* Copy Link */}
        <button
          onClick={handleCopy}
          className="flex-1 px-3 py-2 rounded-lg border border-border text-foreground text-sm font-bold uppercase tracking-wider transition-colors hover:bg-muted"
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>

      {/* Benefits */}
      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
        <p className="font-semibold text-foreground">Your rewards:</p>
        <ul className="space-y-0.5">
          <li>• +2 bonus tickets per share</li>
          <li>• Friend gets +1 free ticket</li>
          <li>• Unlimited referrals</li>
        </ul>
      </div>
    </div>
  )
}
