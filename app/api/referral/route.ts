import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const uid = url.searchParams.get('uid')

    if (!uid) {
      return Response.json({ error: 'Missing uid' }, { status: 400 })
    }

    // Get user with referral info
    const user = await sql`
      SELECT 
        u.referral_code,
        COUNT(DISTINCT u2.id) as referral_count,
        COALESCE(SUM(rr.reward_amount), 0) as total_rewards
      FROM users u
      LEFT JOIN users u2 ON u.id = u2.referred_by_id
      LEFT JOIN referral_rewards rr ON u.id = rr.referrer_id AND rr.is_claimed = true
      WHERE u.uid = ${uid}
      GROUP BY u.id, u.referral_code
    `

    if (user.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    return Response.json({ 
      referralCode: user[0].referral_code,
      referralCount: user[0].referral_count || 0,
      totalRewards: user[0].total_rewards || 0
    }, { status: 200 })
  } catch (error) {
    console.error('[v0] Get referral info error:', error)
    return Response.json({ error: 'Failed to fetch referral info' }, { status: 500 })
  }
}

// Track when someone uses a referral code
export async function POST(req: Request) {
  try {
    const { uid, referralCode } = await req.json()

    if (!uid || !referralCode) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user being referred (the new user)
    const newUser = await sql`SELECT id FROM users WHERE uid = ${uid}`

    if (newUser.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Get referrer
    const referrer = await sql`SELECT id FROM users WHERE referral_code = ${referralCode}`

    if (referrer.length === 0) {
      return Response.json({ error: 'Invalid referral code' }, { status: 400 })
    }

    // Update user with referrer
    await sql`
      UPDATE users 
      SET referred_by_id = ${referrer[0].id}
      WHERE id = ${newUser[0].id}
    `

    // Create referral reward (pending until first ticket purchase)
    const reward = await sql`
      INSERT INTO referral_rewards (referrer_id, referred_user_id, reward_amount, is_claimed, created_at)
      VALUES (${referrer[0].id}, ${newUser[0].id}, 0.5, false, NOW())
      RETURNING id, reward_amount
    `

    return Response.json({ 
      message: 'Referral tracked successfully',
      reward: reward[0]
    }, { status: 201 })
  } catch (error) {
    console.error('[v0] Track referral error:', error)
    return Response.json({ error: 'Failed to track referral' }, { status: 500 })
  }
}
