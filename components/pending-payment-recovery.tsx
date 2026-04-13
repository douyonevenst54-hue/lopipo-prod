'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Clock, RotateCcw, Trash2, Loader2 } from 'lucide-react'
import { getPendingPayments, removePendingPayment, type PendingPaymentStore } from '@/lib/pi-payment-timeout'

interface PendingPaymentRecoveryProps {
  open: boolean
  onClose: () => void
  onRetry: (payment: PendingPaymentStore) => Promise<void>
}

export function PendingPaymentRecovery({ open, onClose, onRetry }: PendingPaymentRecoveryProps) {
  const [pendingPayments, setPendingPayments] = useState<PendingPaymentStore[]>([])
  const [retrying, setRetrying] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      const payments = getPendingPayments()
      setPendingPayments(payments.filter(p => p.status === 'pending'))
    }
  }, [open])

  if (!open || pendingPayments.length === 0) {
    return null
  }

  const handleRetry = async (payment: PendingPaymentStore) => {
    setRetrying(payment.paymentId)
    try {
      await onRetry(payment)
      removePendingPayment(payment.paymentId)
      setPendingPayments(prev => prev.filter(p => p.paymentId !== payment.paymentId))
    } catch (error) {
      console.error('[v0] Retry failed:', error)
    } finally {
      setRetrying(null)
    }
  }

  const handleDismiss = (paymentId: string) => {
    removePendingPayment(paymentId)
    setPendingPayments(prev => prev.filter(p => p.paymentId !== paymentId))
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border max-w-md w-full max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground">Incomplete Payments</h3>
            <p className="text-xs text-muted-foreground mt-1">
              You have {pendingPayments.length} payment{pendingPayments.length !== 1 ? 's' : ''} waiting to be completed.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-lg"
          >
            ✕
          </button>
        </div>

        <div className="divide-y divide-border">
          {pendingPayments.map(payment => {
            const createdAt = new Date(payment.createdAt)
            const now = new Date()
            const minutes = Math.floor((now.getTime() - createdAt.getTime()) / 1000 / 60)
            const isPending = retrying === payment.paymentId

            return (
              <div key={payment.paymentId} className="p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Pending for {minutes}m</p>
                    <p className="text-sm font-bold text-foreground mt-1 truncate">
                      {payment.ticketCount} × Ticket{payment.ticketCount !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {payment.amount} π • Series {payment.seriesId.slice(0, 8)}...
                    </p>
                  </div>
                  <Clock size={16} className="text-amber-500 shrink-0 mt-1" />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRetry(payment)}
                    disabled={isPending}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-gradient-primary hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RotateCcw size={12} />
                        Retry
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDismiss(payment.paymentId)}
                    disabled={isPending}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-muted/50 border-t border-border p-3 text-[10px] text-muted-foreground leading-relaxed">
          Tap Retry to complete your payment. Your ticket will be added to the lottery once confirmed.
        </div>
      </div>
    </div>
  )
}
