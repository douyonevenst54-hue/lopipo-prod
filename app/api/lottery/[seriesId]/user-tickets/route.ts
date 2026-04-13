import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'
import { withDbRetry } from '@/lib/db-retry'

const sql = neon(process.env.DATABASE_URL!)

/**
 * GET /api/lottery/{seriesId}/user-tickets?userId={userId}
 * Returns number of tickets user has purchased in this draw series
 * Used to enforce max tickets per user limit
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { seriesId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const result = await withDbRetry(async () => {
      return await sql`
        SELECT COALESCE(SUM(ticket_count), 0) as count
        FROM lottery_tickets
        WHERE user_id = ${userId} AND series_id = ${params.seriesId}
      `
    })

    const count = result?.[0]?.count || 0

    return NextResponse.json(
      { count, userId, seriesId: params.seriesId },
      { status: 200 }
    )
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('[v0] User tickets API error:', err.message)
    return NextResponse.json({ error: 'Failed to fetch ticket count' }, { status: 500 })
  }
}
