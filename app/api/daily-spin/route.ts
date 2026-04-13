import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'
import { withDbRetry } from '@/lib/db-retry'
import { errorResponse, validateRequestBody } from '@/lib/api-errors'

const sql = neon(process.env.DATABASE_URL!)

interface DailySpinRequest {
  userId: string
  username: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const today = new Date().toDateString()

    const spinRecord = await withDbRetry(async () => {
      return await sql`
        SELECT id, claimed_at, streak_count
        FROM daily_spins
        WHERE user_id = ${userId} AND DATE(claimed_at) = DATE(${today})
        LIMIT 1
      `
    })

    const alreadyClaimedToday = spinRecord && spinRecord.length > 0

    return NextResponse.json({
      alreadyClaimed: alreadyClaimedToday,
      streak: spinRecord?.[0]?.streak_count || 0,
    })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    return errorResponse(err, 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json()
    validateRequestBody<DailySpinRequest>(body, ['userId', 'username'])

    const { userId, username } = body as DailySpinRequest
    const today = new Date().toDateString()
    const DAILY_REWARD = 0.001 // Pi awarded per day

    const existingSpin = await withDbRetry(async () => {
      return await sql`
        SELECT id, streak_count FROM daily_spins
        WHERE user_id = ${userId} AND DATE(claimed_at) = DATE(${today})
        LIMIT 1
      `
    })

    if (existingSpin && existingSpin.length > 0) {
      return NextResponse.json(
        { error: 'Daily spin already claimed' },
        { status: 409 }
      )
    }

    const previousSpin = await withDbRetry(async () => {
      return await sql`
        SELECT claimed_at, streak_count FROM daily_spins
        WHERE user_id = ${userId}
        ORDER BY claimed_at DESC
        LIMIT 1
      `
    })

    let newStreak = 1
    if (previousSpin && previousSpin.length > 0) {
      const lastClaimDate = new Date(previousSpin[0].claimed_at)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      if (lastClaimDate.toDateString() === yesterday.toDateString()) {
        newStreak = previousSpin[0].streak_count + 1
      }
    }

    // Calculate Pi reward with streak bonus
    const streakMultiplier = newStreak >= 7 ? 1.5 : 1.0
    const piReward = DAILY_REWARD * streakMultiplier

    // Record the daily spin
    const result = await withDbRetry(async () => {
      return await sql`
        INSERT INTO daily_spins (user_id, username, claimed_at, streak_count, pi_reward)
        VALUES (${userId}, ${username}, NOW(), ${newStreak}, ${piReward})
        RETURNING id, streak_count, claimed_at
      `
    })

    // Credit Pi to user wallet
    await withDbRetry(async () => {
      return await sql`
        UPDATE user_wallets
        SET balance = balance + ${piReward}, updated_at = NOW()
        WHERE user_id = ${userId}
      `
    })

    console.log(`[v0] Daily spin claimed: ${username} earned ${piReward}π (streak: ${newStreak})`)

    return NextResponse.json(
      {
        message: 'Daily spin claimed',
        streak: newStreak,
        piReward,
        claimedAt: result?.[0]?.claimed_at,
      },
      { status: 201 }
    )
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    return errorResponse(err, 500)
  }
}
