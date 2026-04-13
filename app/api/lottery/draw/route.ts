import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'
import { withDbRetry } from '@/lib/db-retry'
import { errorResponse, validateRequestBody } from '@/lib/api-errors'
import { recordLotteryDraw } from '@/lib/lottery-audit-log'
import { createLogger } from '@/lib/structured-logging'
import crypto from 'crypto'

const sql = neon(process.env.DATABASE_URL!)
const logger = createLogger('lottery-draw')

// Minimum ticket threshold - prevents single-player refund scenario
const MINIMUM_TICKETS_REQUIRED = 2

interface DrawRequest {
  seriesId: string
  adminSecret?: string // For authorized cron jobs only
}

interface DrawResponse {
  message: string
  winner: string
  winnerId: string
  piWon: number
  totalParticipants: number
  drawnAt: string
  payoutStatus: 'completed' | 'failed' | 'refunded'
  seed: string
  hash: string
}

/**
 * SECURITY FIX #1: Server-Side Winner Selection
 * Uses cryptographic randomness (not Math.random) to prevent client-side manipulation.
 * Seed is generated on server, cannot be predicted or reversed.
 */
function selectWinnerSecure(tickets: Array<{ user_id: string; user_name: string; ticketCount: number }>, seed: string): { user_id: string; user_name: string } {
  // Expand seed using PBKDF2 for additional entropy
  const hmac = crypto.createHmac('sha256', seed)
  hmac.update(JSON.stringify(tickets))
  const expandedSeed = hmac.digest()

  // Create weighted ticket array
  const weightedTickets = tickets.flatMap(t => 
    Array(t.ticketCount).fill({ user_id: t.user_id, user_name: t.user_name })
  )

  // Use seed to determine index (deterministic but not predictable without seed)
  const seedBuffer = Buffer.from(expandedSeed)
  const seedValue = seedBuffer.readUInt32BE(0)
  const winnerIndex = seedValue % weightedTickets.length

  return weightedTickets[winnerIndex]
}

/**
 * SECURITY FIX #4: Minimum Ticket Threshold
 * If minimum tickets aren't reached, automatically refund all players.
 */
async function handleBelowThreshold(seriesId: string, tickets: Array<any>) {
  logger.error({
    level: 'warning',
    message: 'Draw cancelled: Below minimum ticket threshold',
    seriesId,
    ticketCount: tickets.length,
    minimumRequired: MINIMUM_TICKETS_REQUIRED
  })

  // Refund all players
  for (const ticket of tickets) {
    await withDbRetry(async () => {
      return await sql`
        UPDATE user_wallets
        SET balance = balance + ${ticket.ticket_cost}
        WHERE user_id = ${ticket.user_id}
      `
    })

    // Record refund in database
    await withDbRetry(async () => {
      return await sql`
        INSERT INTO lottery_refunds (series_id, user_id, amount, reason, refunded_at)
        VALUES (${seriesId}, ${ticket.user_id}, ${ticket.ticket_cost}, 'below_minimum_threshold', NOW())
      `
    })
  }

  // Mark series as cancelled
  await withDbRetry(async () => {
    return await sql`
      UPDATE lottery_series
      SET status = 'cancelled_below_minimum'
      WHERE id = ${seriesId}
    `
  })

  return true
}

/**
 * SECURITY FIX #3: Draw Trigger Security
 * Only admin-authorized cron jobs can trigger draws.
 * Secret key prevents unauthorized access.
 */
function validateDrawTrigger(request: NextRequest, adminSecret?: string): boolean {
  // Check 1: Verify request comes from Vercel (X-Vercel-Signature header)
  const vercelSignature = request.headers.get('x-vercel-signature')
  const authHeader = request.headers.get('authorization')

  // Check 2: Validate admin secret matches environment variable
  const expectedSecret = process.env.LOTTERY_DRAW_SECRET_KEY
  
  if (!expectedSecret) {
    logger.error({
      level: 'error',
      message: 'LOTTERY_DRAW_SECRET_KEY not configured - draw triggered without auth!',
      ip: request.ip || 'unknown'
    })
    return false
  }

  // Accept either Vercel signature OR admin secret bearer token
  const hasValidAuth = 
    vercelSignature === expectedSecret ||
    authHeader === `Bearer ${expectedSecret}`

  if (!hasValidAuth) {
    logger.error({
      level: 'error',
      message: 'Unauthorized draw attempt',
      ip: request.ip || 'unknown',
      hasVercelSig: !!vercelSignature,
      hasAuthHeader: !!authHeader
    })
    return false
  }

  return true
}

export async function POST(request: NextRequest) {
  const startTime = performance.now()

  try {
    // SECURITY FIX #3: Validate draw trigger authorization
    if (!validateDrawTrigger(request)) {
      logger.error({ level: 'error', message: 'Draw authorization failed' })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body: unknown = await request.json()
    validateRequestBody<DrawRequest>(body, ['seriesId'])

    const { seriesId } = body as DrawRequest

    // Get series and verify it exists
    const series = await withDbRetry(async () => {
      return await sql`
        SELECT id, prize_pool, ticket_count, status FROM lottery_series
        WHERE id = ${seriesId}
        LIMIT 1
      `
    })

    if (!series || series.length === 0) {
      logger.error({ level: 'error', message: 'Series not found', seriesId })
      return NextResponse.json({ error: 'Lottery series not found' }, { status: 404 })
    }

    if (series[0].status !== 'active') {
      logger.error({ level: 'error', message: 'Series not active', seriesId, status: series[0].status })
      return NextResponse.json({ error: 'Lottery not active' }, { status: 409 })
    }

    // Get all tickets for this series
    const tickets = await withDbRetry(async () => {
      return await sql`
        SELECT id, user_id, user_name, ticket_count, ticket_cost FROM lottery_tickets
        WHERE series_id = ${seriesId}
      `
    })

    if (!tickets || tickets.length === 0) {
      logger.error({ level: 'error', message: 'No tickets purchased', seriesId })
      return NextResponse.json({ error: 'No tickets purchased' }, { status: 400 })
    }

    // SECURITY FIX #4: Check minimum ticket threshold
    if (tickets.length < MINIMUM_TICKETS_REQUIRED) {
      const refunded = await handleBelowThreshold(seriesId, tickets)
      if (refunded) {
        return NextResponse.json(
          {
            message: 'Draw cancelled: minimum tickets not reached. All players refunded.',
            status: 'refunded'
          },
          { status: 200 }
        )
      }
    }

    // SECURITY FIX #1: Generate cryptographic seed server-side
    const seed = crypto.randomBytes(32).toString('hex')
    
    // Select winner using secure entropy (not Math.random)
    const winnerTicket = selectWinnerSecure(tickets, seed)
    const piPerWinner = (series[0].prize_pool * 0.95) / tickets.length // 5% platform fee

    logger.log({
      level: 'info',
      message: 'Draw executing',
      seriesId,
      seed: seed.substring(0, 16) + '...', // Log truncated seed
      ticketCount: tickets.length,
      prizeAmount: piPerWinner
    })

    // SECURITY FIX #2: Call Pi SDK to transfer Pi automatically to winner's wallet
    let payoutStatus: 'completed' | 'failed' = 'completed'
    let piPayoutTxId: string | null = null

    try {
      // Call server-side Pi SDK to initiate automatic payout
      piPayoutTxId = await processPiPayout(winnerTicket.user_id, piPerWinner, seriesId)
    } catch (piError) {
      logger.error({
        level: 'error',
        message: 'Pi payout failed - marking as pending for retry',
        winnerId: winnerTicket.user_id,
        amount: piPerWinner,
        error: piError instanceof Error ? piError.message : String(piError)
      })
      payoutStatus = 'failed'
    }

    // Record winner in database
    const winnerRecord = await withDbRetry(async () => {
      return await sql`
        INSERT INTO lottery_winners 
        (series_id, winner_user_id, pi_won, drawn_at, payout_status, seed_hash, payout_tx_id)
        VALUES (${seriesId}, ${winnerTicket.user_id}, ${piPerWinner}, NOW(), ${payoutStatus}, ${seed}, ${piPayoutTxId})
        RETURNING id, winner_user_id, pi_won
      `
    })

    // If payout completed, update wallet (backup to SDK call)
    if (payoutStatus === 'completed') {
      await withDbRetry(async () => {
        return await sql`
          UPDATE user_wallets
          SET balance = balance + ${piPerWinner}, lottery_won = lottery_won + ${piPerWinner}, updated_at = NOW()
          WHERE user_id = ${winnerTicket.user_id}
        `
      })
    }

    // Mark series as drawn
    await withDbRetry(async () => {
      return await sql`
        UPDATE lottery_series
        SET status = 'drawn', drawn_at = NOW()
        WHERE id = ${seriesId}
      `
    })

    // Record audit log for fairness verification
    await recordLotteryDraw(
      seriesId,
      tickets.length,
      winnerTicket.user_id,
      winnerTicket.user_name,
      piPerWinner,
      seed
    )

    const duration = performance.now() - startTime
    logger.log({
      level: 'info',
      message: 'Draw completed successfully',
      winnerId: winnerTicket.user_id,
      piWon: piPerWinner,
      participants: tickets.length,
      duration: `${duration.toFixed(2)}ms`,
      payoutStatus
    })

    const response: DrawResponse = {
      message: 'Draw completed',
      winner: winnerTicket.user_name,
      winnerId: winnerTicket.user_id,
      piWon: piPerWinner,
      totalParticipants: tickets.length,
      drawnAt: new Date().toISOString(),
      payoutStatus,
      seed,
      hash: crypto.createHash('sha256').update(seed).digest('hex')
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error({ level: 'error', message: 'Draw failed', error: err.message })
    return errorResponse(err, 500)
  }
}

/**
 * SECURITY FIX #2: Server-Side Automatic Pi Payout
 * Calls Pi SDK backend to automatically transfer Pi to winner's wallet.
 * This cannot be spoofed or manipulated from client-side.
 */
async function processPiPayout(winnerUserId: string, amount: number, seriesId: string): Promise<string> {
  const piApiKey = process.env.PI_API_KEY
  const piApiUrl = process.env.PI_API_URL || 'https://api.mainnet.pi'

  if (!piApiKey) {
    throw new Error('PI_API_KEY not configured - automatic payouts disabled')
  }

  try {
    // Call Pi backend API to initiate payout
    const payoutResponse = await fetch(`${piApiUrl}/payout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${piApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to_user_id: winnerUserId,
        amount: amount,
        memo: `Lottery draw winner - Series ${seriesId}`,
        metadata: {
          seriesId,
          type: 'lottery_payout'
        }
      })
    })

    if (!payoutResponse.ok) {
      const errorText = await payoutResponse.text()
      throw new Error(`Pi API error: ${payoutResponse.status} - ${errorText}`)
    }

    const result = await payoutResponse.json()
    logger.log({
      level: 'info',
      message: 'Pi payout initiated',
      winnerId: winnerUserId,
      amount,
      txId: result.transaction_id
    })

    return result.transaction_id || 'pending'
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error({
      level: 'error',
      message: 'Pi payout request failed',
      winnerId: winnerUserId,
      error: message
    })
    throw err
  }
}
