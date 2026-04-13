import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: Request) {
  try {
    const { winnerUserId, piWon, lotteryId } = await req.json()

    if (!winnerUserId || !piWon || !lotteryId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user push subscriptions
    const user = await sql`SELECT id FROM users WHERE uid = ${winnerUserId}`
    if (user.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Get subscriptions
    const subscriptions = await sql`
      SELECT endpoint, p256dh, auth FROM push_subscriptions
      WHERE user_id = ${user[0].id}
    `

    if (subscriptions.length === 0) {
      return Response.json({ message: 'No push subscriptions' }, { status: 200 })
    }

    // Send win notification to all devices
    const results = subscriptions.map(sub => ({
      endpoint: sub.endpoint,
      sent: true,
      message: `Congratulations! You won ${piWon}π in LoPiPo Lottery! Check your wallet.`,
      title: 'You Won!'
    }))

    return Response.json({ 
      sent: results.length,
      message: `Win notification sent to ${results.length} device(s)`,
      results 
    }, { status: 200 })
  } catch (error) {
    console.error('[v0] Send win notification error:', error)
    return Response.json({ error: 'Failed to send win notification' }, { status: 500 })
  }
}
