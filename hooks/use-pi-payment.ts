'use client'

import { useState, useCallback } from 'react'
import { withPaymentTimeout, savePendingPayment, updatePendingPaymentStatus, removePendingPayment, type PendingPaymentStore } from '@/lib/pi-payment-timeout'

declare global {
  interface Window {
    Pi: {
      createPayment: (paymentData: any) => Promise<{ identifier: string }>
      onIncompletePaymentFound: (callback: (payment: any) => void) => void
    }
  }
}

interface PaymentConfig {
  amount: number
  memo: string
  metadata: {
    seriesId: string
    ticketCount: number
    userName: string
  }
}

interface PaymentResult {
  txid: string
  status: 'completed' | 'pending' | 'failed' | 'cancelled'
}

export const usePiPayment = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState<PaymentResult | null>(null)

  const createLotteryPayment = useCallback(
    async (config: PaymentConfig): Promise<PaymentResult | null> => {
      setIsProcessing(true)
      setPaymentError(null)
      setPaymentSuccess(null)

      let paymentId: string | null = null

      try {
        if (!window.Pi) {
          throw new Error('Pi Network not initialized')
        }

        const paymentData = {
          amount: config.amount,
          memo: config.memo,
          metadata: config.metadata,
        }

        console.log('[v0] Creating Pi payment:', paymentData)

        // Wrap in timeout (30 seconds for Pi Browser to respond)
        const payment = await withPaymentTimeout(
          window.Pi.createPayment(paymentData),
          30000
        )

        if (!payment?.identifier) {
          throw new Error('Payment creation failed - no identifier')
        }

        paymentId = payment.identifier

        // CRITICAL: Save payment immediately before submission
        const pendingPayment: PendingPaymentStore = {
          paymentId,
          seriesId: config.metadata.seriesId,
          amount: config.amount,
          ticketCount: config.metadata.ticketCount,
          userName: config.metadata.userName,
          createdAt: Date.now(),
          status: 'pending',
        }

        savePendingPayment(pendingPayment)
        console.log('[v0] Saved pending payment:', paymentId)

        // Submit to backend with timeout
        console.log('[v0] Submitting payment to backend:', paymentId)

        const response = await withPaymentTimeout(
          fetch('/api/lottery/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId,
              seriesId: config.metadata.seriesId,
              ticketCount: config.metadata.ticketCount,
              userName: config.metadata.userName,
              amount: config.amount,
            }),
          }),
          30000
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Payment processing failed')
        }

        const result = await response.json()

        // Update payment status to completed
        updatePendingPaymentStatus(paymentId, 'completed')

        const successResult: PaymentResult = {
          txid: paymentId,
          status: 'completed',
        }

        setPaymentSuccess(successResult)
        console.log('[v0] Payment completed:', successResult)

        // Remove from pending after successful completion
        removePendingPayment(paymentId)

        return successResult
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Payment failed'
        console.error('[v0] Payment error:', errorMsg)
        setPaymentError(errorMsg)

        // Mark as failed but keep for recovery
        if (paymentId) {
          updatePendingPaymentStatus(paymentId, 'failed')
        }

        return null
      } finally {
        setIsProcessing(false)
      }
    },
    []
  )

  // Handle incomplete payments on app restart
  const handleIncompletePayment = useCallback(async (payment: any) => {
    console.log('[v0] Incomplete payment found:', payment)

    if (!payment?.identifier) return

    try {
      // Save as pending first
      const pending: PendingPaymentStore = {
        paymentId: payment.identifier,
        seriesId: payment.metadata?.seriesId || 'unknown',
        amount: payment.amount || 0,
        ticketCount: payment.metadata?.ticketCount || 0,
        userName: payment.metadata?.userName || 'unknown',
        createdAt: Date.now(),
        status: 'pending',
      }

      savePendingPayment(pending)

      const response = await withPaymentTimeout(
        fetch('/api/lottery/complete-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId: payment.identifier }),
        }),
        30000
      )

      if (response.ok) {
        updatePendingPaymentStatus(payment.identifier, 'completed')
        removePendingPayment(payment.identifier)
        setPaymentSuccess({
          txid: payment.identifier,
          status: 'completed',
        })
      } else {
        updatePendingPaymentStatus(payment.identifier, 'failed')
      }
    } catch (error) {
      console.error('[v0] Error completing incomplete payment:', error)
      updatePendingPaymentStatus(payment.identifier, 'failed')
    }
  }, [])

  return {
    createLotteryPayment,
    handleIncompletePayment,
    isProcessing,
    paymentError,
    paymentSuccess,
  }
}
