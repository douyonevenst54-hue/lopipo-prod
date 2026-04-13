/**
 * Transaction wrapper for Pi Network payment flows
 * Ensures atomicity: payment recorded only if ticket created (and vice versa)
 */

import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface PiPaymentTransaction {
  paymentId: string
  userId: string
  lotteryId: string
  amount: number
  piTxId: string
}

export interface LotteryTicket {
  ticketId: string
  userId: string
  lotteryId: string
  paymentId: string
  createdAt: Date
}

/**
 * Atomically records a Pi payment and lottery ticket entry
 * Uses database transaction to ensure consistency
 */
export async function recordPiPaymentTransaction(
  payment: PiPaymentTransaction,
  ticket: Omit<LotteryTicket, "ticketId" | "createdAt">
): Promise<{ payment: PiPaymentTransaction; ticket: LotteryTicket }> {
  try {
    // Start transaction
    await sql`BEGIN`

    // Insert payment record
    await sql`
      INSERT INTO lottery_payments (id, user_id, lottery_id, amount, pi_tx_id, status)
      VALUES (${payment.paymentId}, ${payment.userId}, ${payment.lotteryId}, ${payment.amount}, ${payment.piTxId}, 'completed')
    `

    // Insert ticket record
    const ticketResult = await sql`
      INSERT INTO lottery_tickets (user_id, lottery_id, payment_id)
      VALUES (${ticket.userId}, ${ticket.lotteryId}, ${ticket.paymentId})
      RETURNING id, created_at
    `

    const ticketId = ticketResult[0]?.id
    const createdAt = ticketResult[0]?.created_at

    if (!ticketId) {
      throw new Error("Failed to create lottery ticket")
    }

    // Update user stats
    await sql`
      UPDATE users
      SET lotteries_entered = lotteries_entered + 1
      WHERE id = ${payment.userId}
    `

    // Update lottery prize pool
    await sql`
      UPDATE lottery_series
      SET prize_pool = prize_pool + ${payment.amount * 0.9}
      WHERE id = ${payment.lotteryId}
    `

    // Commit transaction
    await sql`COMMIT`

    return {
      payment,
      ticket: {
        ticketId,
        userId: ticket.userId,
        lotteryId: ticket.lotteryId,
        paymentId: ticket.paymentId,
        createdAt: new Date(createdAt),
      },
    }
  } catch (error) {
    // Rollback on any error
    try {
      await sql`ROLLBACK`
    } catch (rollbackError) {
      console.error("[Payment Transaction] Rollback failed:", rollbackError)
    }

    console.error("[Payment Transaction] Error:", error)
    throw error
  }
}

/**
 * Marks a payment as incomplete (user cancelled or timed out)
 * Keeps the record for audit trail
 */
export async function markPaymentIncomplete(paymentId: string, reason: string): Promise<void> {
  try {
    await sql`
      UPDATE lottery_payments
      SET status = 'incomplete', reason = ${reason}, updated_at = NOW()
      WHERE id = ${paymentId}
    `
  } catch (error) {
    console.error("[Payment] Failed to mark incomplete:", error)
    throw error
  }
}

/**
 * Retrieves a payment record with its associated ticket
 */
export async function getPaymentWithTicket(paymentId: string) {
  try {
    const result = await sql`
      SELECT 
        lp.id as payment_id,
        lp.user_id,
        lp.lottery_id,
        lp.amount,
        lp.pi_tx_id,
        lp.status,
        lt.id as ticket_id,
        lt.created_at
      FROM lottery_payments lp
      LEFT JOIN lottery_tickets lt ON lp.id = lt.payment_id
      WHERE lp.id = ${paymentId}
    `

    return result[0] || null
  } catch (error) {
    console.error("[Payment] Failed to fetch:", error)
    throw error
  }
}
