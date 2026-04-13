import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// Subscribe to push notifications
export async function POST(req: Request) {
  try {
    const { uid, subscription } = await req.json()

    if (!uid || !subscription) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user
    const user = await sql`SELECT id FROM users WHERE uid = ${uid}`

    if (user.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Store subscription
    const result = await sql`
      INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, created_at)
      VALUES (${user[0].id}, ${subscription.endpoint}, ${subscription.keys.p256dh}, ${subscription.keys.auth}, NOW())
      ON CONFLICT (endpoint) DO UPDATE SET updated_at = NOW()
      RETURNING id
    `

    return Response.json(
      { 
        subscription: result[0],
        message: 'Subscription saved'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Subscribe error:', error)
    return Response.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}

// Get user subscriptions
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const uid = url.searchParams.get('uid')

    if (!uid) {
      return Response.json({ error: 'Missing uid' }, { status: 400 })
    }

    const user = await sql`SELECT id FROM users WHERE uid = ${uid}`

    if (user.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const subscriptions = await sql`
      SELECT id, endpoint, created_at FROM push_subscriptions
      WHERE user_id = ${user[0].id}
    `

    return Response.json({ subscriptions }, { status: 200 })
  } catch (error) {
    console.error('[v0] Get subscriptions error:', error)
    return Response.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }
}
