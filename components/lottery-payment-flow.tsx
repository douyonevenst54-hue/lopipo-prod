'use client'

import { useState, useCallback } from 'react'
import { AlertCircle, CheckCircle2, Loader2, Ticket, Copy, Check } from 'lucide-react'
import { usePiPayment } from '@/hooks/use-pi-payment'

interface LotteryPaymentFlowProps {
  seriesId: string
  seriesTitle: string
  ticketPrice: number
  userName: string
  ticketCount: number
  onPaymentSuccess: (result: {
    ticketId: string
    ticketCount: number
    totalCost: number
    prizePoolShare: number
  }) => void
  onPaymentError: (error: string) => void
}

export function LotteryPaymentFlow({
  seriesId,
  seriesTitle,
  ticketPrice,
  userName,
  ticketCount,
  onPaymentSuccess,
  onPaymentError,
}: LotteryPaymentFlowProps) {
  const { createLotteryPayment, isProcessing, paymentError, paymentSuccess } = usePiPayment()
  const [copiedTicketId, setCopiedTicketId] = useState(false)

  const totalCost = ticketPrice * ticketCount
  const prizePoolShare = totalCost * 0.9

  const handleBuyTickets = useCallback(async () => {
    if (!userName) {
      onPaymentError('Username required')
      return
    }

    const result = await createLotteryPayment({
      amount: totalCost,
      memo: `LoPiPo Lottery: ${seriesTitle} (${ticketCount} tickets)`,
      metadata: {
        seriesId,
        ticketCount,
        userName,
      },
    })

    if (result) {
      onPaymentSuccess({
        ticketId: result.txid,
        ticketCount,
        totalCost,
        prizePoolShare,
      })
    } else if (paymentError) {
      onPaymentError(paymentError)
    }
  }, [seriesId, seriesTitle, ticketCount, userName, totalCost, createLotteryPayment, onPaymentSuccess, onPaymentError, prizePoolShare, paymentError])

  // Payment processing state
  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 rounded-xl border border-border bg-card">
        <Loader2 size={32} className="text-primary animate-spin" />
        <div className="text-center">
          <p className="font-bold text-foreground">Processing payment...</p>
          <p className="text-xs text-muted-foreground">Do not close this window</p>
        </div>
      </div>
    )
  }

  // Payment success state
  if (paymentSuccess) {
    return (
      <div className="flex flex-col gap-4 p-6 rounded-xl border border-primary/30 bg-primary/5">
        <div className="flex items-start gap-3">
          <CheckCircle2 size={24} className="text-primary shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-bold text-foreground">Payment successful!</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {ticketCount} ticket{ticketCount > 1 ? 's' : ''} purchased for {totalCost} π
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-muted rounded">
            <p className="text-muted-foreground">Prize Pool Share</p>
            <p className="font-bold text-primary">{prizePoolShare.toFixed(2)} π</p>
          </div>
          <div className="p-2 bg-muted rounded">
            <p className="text-muted-foreground">Transaction ID</p>
            <p className="font-mono text-[10px] font-bold truncate">{paymentSuccess.txid.slice(0, 8)}...</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 p-3 bg-background rounded-lg border border-border">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase">Ticket ID</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono font-bold text-foreground bg-muted px-2 py-1 rounded truncate">
              {paymentSuccess.txid}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(paymentSuccess.txid)
                setCopiedTicketId(true)
                setTimeout(() => setCopiedTicketId(false), 2000)
              }}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold text-primary hover:bg-primary/10 transition-colors"
            >
              {copiedTicketId ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-muted rounded-lg border border-border text-xs">
          <Ticket size={16} className="text-primary shrink-0 mt-0.5" />
          <p className="text-muted-foreground">
            Keep your ticket ID safe. You&apos;ll need it to claim prizes after the draw.
          </p>
        </div>
      </div>
    )
  }

  // Payment error state
  if (paymentError) {
    return (
      <div className="flex flex-col gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-destructive shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-destructive">Payment failed</p>
            <p className="text-xs text-muted-foreground mt-1">{paymentError}</p>
          </div>
        </div>
        <button
          onClick={handleBuyTickets}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-gradient-primary hover:opacity-90 transition-opacity active:scale-[0.98]"
        >
          Try again
        </button>
      </div>
    )
  }

  // Initial state - ready to pay
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="p-3 bg-muted rounded-lg text-center">
          <p className="text-muted-foreground mb-1">Tickets</p>
          <p className="font-bold text-foreground text-lg">{ticketCount}</p>
        </div>
        <div className="p-3 bg-muted rounded-lg text-center">
          <p className="text-muted-foreground mb-1">Price Each</p>
          <p className="font-bold text-foreground text-lg">{ticketPrice} π</p>
        </div>
        <div className="p-3 bg-primary/10 rounded-lg text-center border border-primary/20">
          <p className="text-primary mb-1 text-[10px] font-semibold">Total Cost</p>
          <p className="font-bold text-primary text-lg">{totalCost.toFixed(2)} π</p>
        </div>
      </div>

      <div className="p-3 bg-muted rounded-lg">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-muted-foreground">Prize Pool Contribution</span>
          <span className="font-bold text-primary">{prizePoolShare.toFixed(2)} π (90%)</span>
        </div>
        <div className="h-1.5 rounded-full bg-background overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: '90%',
              background: 'linear-gradient(90deg, #E8520A, #FF6B4A)',
            }}
          />
        </div>
      </div>

      <button
        onClick={handleBuyTickets}
        disabled={isProcessing}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-primary shadow-glow-primary hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        <Ticket size={16} />
        Buy {ticketCount} Ticket{ticketCount > 1 ? 's' : ''} for {totalCost} π
      </button>

      <p className="text-center text-[10px] text-muted-foreground">
        Clicking buy will open the Pi Network payment sheet
      </p>
    </div>
  )
}
