export function withPaymentTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error('Payment timeout - Pi Browser may be unresponsive')),
        timeoutMs
      )
    ),
  ])
}

export interface PendingPaymentStore {
  paymentId: string
  seriesId: string
  amount: number
  ticketCount: number
  userName: string
  createdAt: number
  status: 'pending' | 'completed' | 'failed'
}

export function savePendingPayment(payment: PendingPaymentStore): void {
  if (typeof window === 'undefined') return
  
  try {
    const pending = JSON.parse(localStorage.getItem('lopipo_pending_payments') || '[]') as PendingPaymentStore[]
    pending.push(payment)
    localStorage.setItem('lopipo_pending_payments', JSON.stringify(pending))
    console.log('[v0] Saved pending payment:', payment.paymentId)
  } catch (error) {
    console.error('[v0] Failed to save pending payment:', error)
  }
}

export function getPendingPayments(): PendingPaymentStore[] {
  if (typeof window === 'undefined') return []
  
  try {
    return JSON.parse(localStorage.getItem('lopipo_pending_payments') || '[]') as PendingPaymentStore[]
  } catch {
    return []
  }
}

export function removePendingPayment(paymentId: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const pending = JSON.parse(localStorage.getItem('lopipo_pending_payments') || '[]') as PendingPaymentStore[]
    const filtered = pending.filter(p => p.paymentId !== paymentId)
    localStorage.setItem('lopipo_pending_payments', JSON.stringify(filtered))
    console.log('[v0] Removed pending payment:', paymentId)
  } catch (error) {
    console.error('[v0] Failed to remove pending payment:', error)
  }
}

export function updatePendingPaymentStatus(paymentId: string, status: 'pending' | 'completed' | 'failed'): void {
  if (typeof window === 'undefined') return
  
  try {
    const pending = JSON.parse(localStorage.getItem('lopipo_pending_payments') || '[]') as PendingPaymentStore[]
    const updated = pending.map(p => 
      p.paymentId === paymentId ? { ...p, status } : p
    )
    localStorage.setItem('lopipo_pending_payments', JSON.stringify(updated))
    console.log('[v0] Updated payment status:', paymentId, status)
  } catch (error) {
    console.error('[v0] Failed to update payment status:', error)
  }
}
