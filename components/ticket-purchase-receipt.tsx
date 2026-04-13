'use client'

import { useState } from 'react'
import { Download, Share2, Check, Ticket } from 'lucide-react'

interface TicketReceipt {
  ticketId: string
  ticketNumber: string
  quantity: number
  pricePerTicket: number
  totalCost: number
  seriesId: string
  drawDate: string
  prizePool: number
  purchasedAt: string
}

interface TicketPurchaseReceiptProps {
  receipt: TicketReceipt
  onClose: () => void
}

export function TicketPurchaseReceipt({ receipt, onClose }: TicketPurchaseReceiptProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const text = `I just bought ${receipt.quantity} ticket(s) in the LoPiPo Lottery! 🎰 Prize pool: ${receipt.prizePool}π - Draw on ${new Date(receipt.drawDate).toLocaleDateString()}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'LoPiPo Lottery Ticket', text })
      } else {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      console.log('[v0] Share error:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="glass-panel max-w-md w-full rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-b border-green-500/30 p-6 text-center">
          <Ticket className="w-12 h-12 mx-auto text-green-400 mb-3" />
          <h2 className="text-2xl font-bold text-foreground">Ticket Confirmed</h2>
          <p className="text-sm text-muted-foreground mt-1">Your lottery entry is secured</p>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-5">
          {/* Ticket Number */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Ticket Number</p>
            <p className="text-lg font-mono font-bold text-primary">{receipt.ticketNumber}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Tickets</p>
              <p className="text-2xl font-bold text-foreground">{receipt.quantity}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Cost</p>
              <p className="text-2xl font-bold text-gradient">{receipt.totalCost}π</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Prize Pool</p>
              <p className="text-xl font-bold text-amber-400">{receipt.prizePool}π</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Draw Date</p>
              <p className="text-sm font-semibold text-foreground">{new Date(receipt.drawDate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-[10px] text-muted-foreground text-center pt-2 border-t border-border">
            Purchased: {new Date(receipt.purchasedAt).toLocaleString()}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-gold hover:opacity-90 transition-opacity"
            >
              <Share2 size={16} />
              Share
            </button>
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-foreground border border-primary/30 bg-primary/5 hover:bg-primary/10"
            >
              <Check size={16} />
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
