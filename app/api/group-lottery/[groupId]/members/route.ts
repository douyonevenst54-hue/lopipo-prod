import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// Join a group lottery
export async function POST(req: Request) {
  try {
    const { uid, groupCode } = await req.json()

    if (!uid || !groupCode) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user
    const user = await sql`SELECT id FROM users WHERE uid = ${uid}`

    if (user.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Get group
    const group = await sql`SELECT id FROM lottery_groups WHERE group_code = ${groupCode}`

    if (group.length === 0) {
      return Response.json({ error: 'Invalid group code' }, { status: 404 })
    }

    // Check if already member
    const existing = await sql`
      SELECT id FROM lottery_group_members 
      WHERE group_id = ${group[0].id} AND user_id = ${user[0].id}
    `

    if (existing.length > 0) {
      return Response.json({ error: 'You are already a member of this group' }, { status: 400 })
    }

    // Join group
    const member = await sql`
      INSERT INTO lottery_group_members (group_id, user_id, joined_at)
      VALUES (${group[0].id}, ${user[0].id}, NOW())
      RETURNING id
    `

    return Response.json(
      { 
        member: member[0],
        message: 'Successfully joined group'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Join group error:', error)
    return Response.json({ error: 'Failed to join group' }, { status: 500 })
  }
}

// Get group members
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const groupId = url.searchParams.get('groupId')

    if (!groupId) {
      return Response.json({ error: 'Missing groupId' }, { status: 400 })
    }

    const members = await sql`
      SELECT 
        u.uid,
        u.pi_username,
        p.display_name,
        p.avatar_url,
        COUNT(DISTINCT lgt.id) as tickets_bought
      FROM lottery_group_members lgm
      JOIN users u ON lgm.user_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN lottery_group_tickets lgt ON lgm.user_id = lgt.buyer_id
      WHERE lgm.group_id = ${groupId}
      GROUP BY u.id, p.id
      ORDER BY tickets_bought DESC
    `

    return Response.json({ members }, { status: 200 })
  } catch (error) {
    console.error('[v0] Get members error:', error)
    return Response.json({ error: 'Failed to fetch members' }, { status: 500 })
  }
}
