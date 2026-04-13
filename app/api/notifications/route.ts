import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const uid = url.searchParams.get('uid')

    if (!uid) {
      return Response.json({ error: 'Missing uid' }, { status: 400 })
    }

    // Get user id
    const user = await sql`SELECT id FROM users WHERE uid = ${uid}`

    if (user.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = user[0].id

    // Get unread notifications
    const notifications = await sql`
      SELECT id, message, type, read_status, created_at
      FROM notifications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `

    return Response.json({ notifications }, { status: 200 })
  } catch (error) {
    console.error('[v0] Get notifications error:', error)
    return Response.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { uid, message, type } = await req.json()

    if (!uid || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user id
    const user = await sql`SELECT id FROM users WHERE uid = ${uid}`

    if (user.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = user[0].id

    // Create notification
    const result = await sql`
      INSERT INTO notifications (user_id, message, type, read_status, created_at)
      VALUES (${userId}, ${message}, ${type || 'info'}, false, NOW())
      RETURNING id, message, type
    `

    return Response.json({ notification: result[0] }, { status: 201 })
  } catch (error) {
    console.error('[v0] Create notification error:', error)
    return Response.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { notificationId, readStatus } = await req.json()

    if (!notificationId) {
      return Response.json({ error: 'Missing notification id' }, { status: 400 })
    }

    const result = await sql`
      UPDATE notifications
      SET read_status = ${readStatus !== undefined ? readStatus : true}
      WHERE id = ${notificationId}
      RETURNING id, read_status
    `

    if (result.length === 0) {
      return Response.json({ error: 'Notification not found' }, { status: 404 })
    }

    return Response.json({ notification: result[0] }, { status: 200 })
  } catch (error) {
    console.error('[v0] Update notification error:', error)
    return Response.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
