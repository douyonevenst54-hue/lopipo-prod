'use server'

import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'
import { withDbRetry, dbErrorResponse } from '@/lib/db-retry'
import { recordPiPaymentTransaction } from '@/lib/payment-transaction'
import { errorResponse, validateRequestBody, logApiError } from '@/lib/api-errors'

const sql = neon(process.env.DATABASE_URL!)

interface LotteryPurchaseRequest {
  paymentId: string
  seriesId: string
  ticketCount: number
  userName: string
  amount: number
  userId?: string
}

export async function POST(request: NextRequest) {
  const route = request.nextUrl.pathname
  const method = request.method

  try {
    const body: unknown = await request.json()

    // Validate required fields
    validateRequestBody<LotteryPurchaseRequest>(body, [
      'paymentId',
      'seriesId',
      'ticketCount',
      'userName',
      'amount',
    ])

    const { paymentId, seriesId, ticketCount, userName, amount, userId } = body

    // Validate business logic
    if (ticketCount < 1 || amount < 0.5) {
      return NextResponse.json(
        { error: 'Invalid ticket count or amount' },
        { status: 400 }
      )
    }

    // Check for idempotency with retry
    const existingPayment = await withDbRetry(async () => {
      return await sql`
        SELECT id, status FROM lottery_payments
        WHERE payment_id = ${paymentId}
        LIMIT 1
      `
    })

    if (existingPayment && existingPayment.length > 0) {
      console.log(`[Lottery] Payment already processed: ${paymentId}`)
      return NextResponse.json(
        {
          message: 'Payment already processed',
          ticketId: existingPayment[0].id,
          status: 'completed',
        },
        { status: 200 }
      )
    }

    // Verify series exists with retry
    const series = await withDbRetry(async () => {
      return await sql`
        SELECT id, prize_pool, max_tickets, ticket_count
        FROM lottery_series
        WHERE id = ${seriesId}
        LIMIT 1
      `
    })

    if (!series || series.length === 0) {
      return NextResponse.json(
        { error: 'Lottery series not found' },
        { status: 404 }
      )
    }

    const currentSeries = series[0]
    const totalTickets = (currentSeries.ticket_count || 0) + ticketCount

    if (totalTickets > currentSeries.max_tickets) {
      return NextResponse.json(
        { error: 'Not enough tickets available' },
        { status: 409 }
      )
    }

    // SECURITY: Check max tickets per user (prevent whale gaming)
    const MAX_TICKETS_PER_USER = 20 // Configurable limit
    
    if (userId) {
      const userTickets = await withDbRetry(async () => {
        return await sql`
          SELECT SUM(ticket_count) as total_tickets
          FROM lottery_tickets
          WHERE user_id = ${userId} AND series_id = ${seriesId}
          LIMIT 1
        `
      })

      const currentUserTickets = userTickets?.[0]?.total_tickets || 0
      const newTotal = currentUserTickets + ticketCount

      if (newTotal > MAX_TICKETS_PER_USER) {
        return NextResponse.json(
          {
            error: `Max ${MAX_TICKETS_PER_USER} tickets per user per draw. You already have ${currentUserTickets}.`,
            maxAllowed: MAX_TICKETS_PER_USER,
            currentOwned: currentUserTickets,
            remaining: MAX_TICKETS_PER_USER - currentUserTickets
          },
          { status: 409 }
        )
      }
    }

    // Execute payment transaction with retry
    const transaction = await withDbRetry(async () => {
      return await recordPiPaymentTransaction(
        {
          paymentId,
          userId: userId || 'anonymous',
          lotteryId: seriesId,
          amount,
          piTxId: paymentId,
        },
        {
          userId: userId || 'anonymous',
          lotteryId: seriesId,
          paymentId,
        }
      )
    })

    console.log(`[Lottery] Purchase completed: ${transaction.ticket.ticketId}`)

    return NextResponse.json(
      {
        message: 'Payment successful',
        ticketId: transaction.ticket.ticketId,
        ticketCount,
        purchasedAt: transaction.ticket.createdAt,
        prizePoolShare: amount * 0.9,
        status: 'completed',
      },
      { status: 201 }
    )
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    logApiError({
      route,
      method,
      error: err,
      statusCode: 500,
    })

    return errorResponse(err, 500, { route, method })
  }
}
