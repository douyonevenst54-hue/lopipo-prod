import { neon } from '@neondatabase/serverless'
import { nanoid } from 'nanoid'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: Request) {
  try {
    const { uid, groupName, groupDescription, ticketPrice, maxParticipants } = await req.json()

    if (!uid || !groupName) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user
    const user = await sql`SELECT id FROM users WHERE uid = ${uid}`

    if (user.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate group code
    const groupCode = nanoid(6).toUpperCase()

    // Create group
    const group = await sql`
      INSERT INTO lottery_groups (creator_id, group_name, group_description, group_code, ticket_price, max_participants, created_at)
      VALUES (${user[0].id}, ${groupName}, ${groupDescription || ''}, ${groupCode}, ${ticketPrice || 0.5}, ${maxParticipants || 100}, NOW())
      RETURNING id, group_code
    `

    // Add creator as member
    await sql`
      INSERT INTO lottery_group_members (group_id, user_id, joined_at)
      VALUES (${group[0].id}, ${user[0].id}, NOW())
    `

    return Response.json(
      { 
        group: group[0],
        message: 'Group lottery created successfully'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Create group error:', error)
    return Response.json({ error: 'Failed to create group' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const groupCode = url.searchParams.get('code')
    const uid = url.searchParams.get('uid')

    if (groupCode) {
      // Get specific group
      const group = await sql`
        SELECT 
          lg.id,
          lg.group_name,
          lg.group_description,
          lg.group_code,
          lg.ticket_price,
          COUNT(DISTINCT lgm.id) as member_count,
          COALESCE(SUM(lgt.amount), 0) as prize_pool
        FROM lottery_groups lg
        LEFT JOIN lottery_group_members lgm ON lg.id = lgm.group_id
        LEFT JOIN lottery_group_tickets lgt ON lg.id = lgt.group_id
        WHERE lg.group_code = ${groupCode}
        GROUP BY lg.id
      `

      if (group.length === 0) {
        return Response.json({ error: 'Group not found' }, { status: 404 })
      }

      return Response.json({ group: group[0] }, { status: 200 })
    }

    if (uid) {
      // Get user's groups
      const groups = await sql`
        SELECT 
          lg.id,
          lg.group_name,
          lg.group_code,
          lg.ticket_price,
          COUNT(DISTINCT lgm.id) as member_count,
          COALESCE(SUM(lgt.amount), 0) as prize_pool
        FROM lottery_groups lg
        LEFT JOIN lottery_group_members lgm ON lg.id = lgm.group_id
        LEFT JOIN lottery_group_tickets lgt ON lg.id = lgt.group_id
        WHERE EXISTS (
          SELECT 1 FROM lottery_group_members lgm2
          WHERE lgm2.group_id = lg.id AND lgm2.user_id = (SELECT id FROM users WHERE uid = ${uid})
        )
        GROUP BY lg.id
        ORDER BY lg.created_at DESC
      `

      return Response.json({ groups }, { status: 200 })
    }

    return Response.json({ error: 'Missing parameters' }, { status: 400 })
  } catch (error) {
    console.error('[v0] Get group error:', error)
    return Response.json({ error: 'Failed to fetch group' }, { status: 500 })
  }
}
