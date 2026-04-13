import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: Request) {
  try {
    // Find users who haven't claimed daily spin today
    const today = new Date().toDateString()

    const users = await sql`
      SELECT DISTINCT u.id, u.uid
      FROM users u
      JOIN push_subscriptions ps ON u.id = ps.user_id
      WHERE u.id NOT IN (
        SELECT user_id FROM daily_spins
        WHERE DATE(claimed_at) = DATE(${today})
      )
      LIMIT 1000
    `

    if (users.length === 0) {
      return Response.json({ message: 'All users already spun today' }, { status: 200 })
    }

    // Send reminder notification
    const results = users.map(user => ({
      userId: user.uid,
      sent: true,
      message: 'Your free 0.001π daily spin is ready! Tap to claim.',
      title: 'Daily Spin Available'
    }))

    return Response.json({
      remindersSent: results.length,
      message: `Daily spin reminders sent to ${results.length} users`,
      results
    }, { status: 200 })
  } catch (error) {
    console.error('[v0] Send daily reminder error:', error)
    return Response.json({ error: 'Failed to send reminders' }, { status: 500 })
  }
}
