import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'
import { withDbRetry } from '@/lib/db-retry'
import { errorResponse } from '@/lib/api-errors'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week'
    const limit = parseInt(searchParams.get('limit') || '5', 10)

    let dateFilter = 'INTERVAL \'7 days\''
    if (period === 'month') dateFilter = 'INTERVAL \'30 days\''
    if (period === 'all') dateFilter = 'INTERVAL \'1000 days\''

    const leaderboard = await withDbRetry(async () => {
      return await sql`
        SELECT 
          u.id,
          u.username,
          COALESCE(SUM(CAST(pr.pi_amount AS NUMERIC)), 0) as pi_won,
          COUNT(lt.id) as total_tickets,
          ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(CAST(pr.pi_amount AS NUMERIC)), 0) DESC) as rank
        FROM users u
        LEFT JOIN lottery_tickets lt ON u.id = lt.user_id 
          AND lt.created_at > NOW() - ${dateFilter}::INTERVAL
        LEFT JOIN referral_rewards pr ON u.id = pr.referrer_id 
          AND pr.created_at > NOW() - ${dateFilter}::INTERVAL
        GROUP BY u.id, u.username
        HAVING COUNT(lt.id) > 0 OR COALESCE(SUM(CAST(pr.pi_amount AS NUMERIC)), 0) > 0
        ORDER BY pi_won DESC, total_tickets DESC
        LIMIT ${limit}
      `
    })

    return NextResponse.json({ leaderboard, period }, { status: 200 })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    return errorResponse(err, 500)
  }
}
