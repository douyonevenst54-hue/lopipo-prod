"use client"

import { useState, useCallback } from "react"
import { Copy, Check, Share2, Users, Gift, TrendingUp, Zap } from "lucide-react"

interface ReferralBannerProps {
  uid: string
  referralCode: string
  referralCount: number
  totalRewards: number
}

export function ReferralBanner({
  uid,
  referralCode,
  referralCount,
  totalRewards,
}: ReferralBannerProps) {
  const [copied, setCopied] = useState(false)
  const referralUrl = typeof window !== "undefined"
    ? `${window.location.origin}?ref=${referralCode}`
    : ""

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (err) {
      console.error("[v0] Copy error:", err)
    }
  }, [referralUrl])

  const handleShare = useCallback(async () => {
    const shareText = `Join me on LoPiPo and win real Pi! Use my referral link: ${referralUrl} #LoPiPo #PiNetwork`
    try {
      if (navigator.share) {
        await navigator.share({
          title: "LoPiPo - Spin to Win",
          text: shareText,
        })
      } else {
        await navigator.clipboard.writeText(shareText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    } catch (err) {
      console.error("[v0] Share error:", err)
    }
  }, [referralUrl])

  return (
    <section className="space-y-6">
      {/* Header with CTA */}
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-amber-500/10 via-background to-amber-500/5 p-6 flex flex-col gap-4 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl -z-10" />
        
        {/* Title */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shrink-0">
              <Gift size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Refer & Earn</h3>
              <p className="text-xs text-muted-foreground">0.1π per friend</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gradient">{totalRewards.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">π earned</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-3 text-center">
            <p className="text-2xl font-bold text-primary">{referralCount}</p>
            <p className="text-[10px] text-muted-foreground font-semibold">Friends Invited</p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{(referralCount * 0.1).toFixed(1)}</p>
            <p className="text-[10px] text-muted-foreground font-semibold">π Pending</p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-3 text-center">
            <p className="text-2xl font-bold text-green-400">+{Math.min(referralCount, 10)}</p>
            <p className="text-[10px] text-muted-foreground font-semibold">Bonus Tickets</p>
          </div>
        </div>
      </div>

      {/* How It Works - 3 Steps */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-foreground px-1">How it works:</h4>
        <div className="grid grid-cols-3 gap-3">
          {/* Step 1 */}
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 flex flex-col items-center text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-white font-bold text-sm">
              1
            </div>
            <p className="text-xs font-semibold text-foreground">Share Link</p>
            <p className="text-[10px] text-muted-foreground">Send referral code</p>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center">
            <div className="w-0.5 h-1 bg-gradient-to-r from-border to-transparent" />
            <TrendingUp size={14} className="text-muted-foreground mx-1" />
            <div className="w-0.5 h-1 bg-gradient-to-l from-border to-transparent" />
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 flex flex-col items-center text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-gradient-blue flex items-center justify-center text-white font-bold text-sm">
              2
            </div>
            <p className="text-xs font-semibold text-foreground">They Join</p>
            <p className="text-[10px] text-muted-foreground">Use your code</p>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center col-span-3">
            <Zap size={14} className="text-amber-400" />
          </div>

          {/* Step 3 */}
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 flex flex-col items-center text-center space-y-2 col-span-3">
            <div className="w-8 h-8 rounded-full bg-gradient-green flex items-center justify-center text-white font-bold text-sm">
              3
            </div>
            <p className="text-xs font-semibold text-foreground">You Earn 0.1π</p>
            <p className="text-[10px] text-muted-foreground">Instantly in wallet</p>
          </div>
        </div>
      </div>

      {/* Referral Link Card */}
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 flex flex-col gap-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Your Referral Link
        </p>
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3 border border-border">
          <code className="flex-1 text-xs text-foreground font-mono overflow-x-auto tracking-tight truncate">
            {referralCode}
          </code>
          <button
            onClick={handleCopy}
            className="shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors"
            aria-label="Copy referral code"
          >
            {copied ? (
              <Check size={14} className="text-green-400" />
            ) : (
              <Copy size={14} className="text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleCopy}
          className="rounded-xl px-4 py-3 text-sm font-bold text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all active:scale-95"
        >
          <Copy size={14} className="mx-auto mb-1" />
          Copy Link
        </button>
        <button
          onClick={handleShare}
          className="rounded-xl px-4 py-3 text-sm font-bold text-white bg-gradient-gold shadow-glow-gold hover:opacity-90 transition-opacity active:scale-95"
        >
          <Share2 size={14} className="mx-auto mb-1" />
          Share
        </button>
      </div>

      {/* Motivation Text */}
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
        <p className="text-xs text-amber-200">
          <strong>Your name could be next on the leaderboard!</strong> Earn rewards and climb the ranks.
        </p>
      </div>
    </section>
  )
}
