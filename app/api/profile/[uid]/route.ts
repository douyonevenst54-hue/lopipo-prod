import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(
  req: Request,
  { params }: { params: { uid: string } }
) {
  try {
    const { uid } = params

    const result = await sql`
      SELECT 
        u.id,
        u.uid,
        u.pi_username,
        u.referral_code,
        u.referred_by,
        u.created_at,
        p.display_name,
        p.avatar_url,
        p.polls_created,
        p.lotteries_entered,
        p.pi_won,
        COALESCE(SUM(rr.reward_amount), 0) as total_referral_rewards
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN referral_rewards rr ON u.id = rr.referrer_id AND rr.is_claimed = true
      WHERE u.uid = ${uid}
      GROUP BY u.id, p.id
    `

    if (result.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    return Response.json({ user: result[0] }, { status: 200 })
  } catch (error) {
    console.error('[v0] Get profile error:', error)
    return Response.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { uid, displayName, avatarUrl } = await req.json()

    if (!uid) {
      return Response.json({ error: 'Missing uid' }, { status: 400 })
    }

    // Get user id
    const user = await sql`SELECT id FROM users WHERE uid = ${uid}`

    if (user.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = user[0].id

    // Update profile
    const result = await sql`
      UPDATE profiles 
      SET display_name = ${displayName || ''}, avatar_url = ${avatarUrl || ''}
      WHERE user_id = ${userId}
      RETURNING *
    `

    return Response.json({ profile: result[0] }, { status: 200 })
  } catch (error) {
    console.error('[v0] Update profile error:', error)
    return Response.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
