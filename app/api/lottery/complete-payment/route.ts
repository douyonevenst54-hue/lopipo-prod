'use server'

import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

interface CompletePaymentRequest {
  paymentId: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CompletePaymentRequest = await request.json()
    const { paymentId } = body

    if (!paymentId) {
      return NextResponse.json(
        { message: 'Payment ID required' },
        { status: 400 }
      )
    }

    console.log('[v0] Completing incomplete payment:', paymentId)

    // Check if payment exists and is still pending
    const payment = await sql`
      SELECT id, series_id, ticket_count, amount, status
      FROM lottery_payments
      WHERE payment_id = ${paymentId}
      LIMIT 1
    `

    if (!payment || payment.length === 0) {
      return NextResponse.json(
        { message: 'Payment not found' },
        { status: 404 }
      )
    }

    const paymentRecord = payment[0]

    // If already completed, return success
    if (paymentRecord.status === 'completed') {
      return NextResponse.json(
        { message: 'Payment already completed', status: 'completed' },
        { status: 200 }
      )
    }

    // Update payment status to completed
    await sql`
      UPDATE lottery_payments
      SET status = 'completed'
      WHERE payment_id = ${paymentId}
    `

    console.log('[v0] Incomplete payment completed:', paymentId)

    return NextResponse.json(
      {
        message: 'Payment completed',
        status: 'completed',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error completing payment:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
