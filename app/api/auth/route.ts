import { neon } from '@neondatabase/serverless'
import { nanoid } from 'nanoid'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: Request) {
  try {
    const { piUsername, uid, wallet } = await req.json()

    if (!piUsername || !uid) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user already exists
    const existing = await sql`
      SELECT id FROM users WHERE uid = ${uid}
    `

    if (existing.length > 0) {
      return Response.json({ success: true, message: 'User already exists' }, { status: 200 })
    }

    // Generate unique referral code
    const referralCode = nanoid(8)

    // Create new user
    const result = await sql`
      INSERT INTO users (uid, pi_username, wallet, referral_code, created_at)
      VALUES (${uid}, ${piUsername}, ${wallet || ''}, ${referralCode}, NOW())
      RETURNING id, uid, referral_code
    `

    // Create user profile
    await sql`
      INSERT INTO profiles (user_id, display_name, polls_created, lotteries_entered, pi_won)
      VALUES (${result[0].id}, ${piUsername}, 0, 0, 0)
    `

    return Response.json(
      { 
        success: true, 
        user: result[0],
        message: 'User created successfully' 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Auth error:', error)
    return Response.json(
      { error: 'Failed to authenticate user' },
      { status: 500 }
    )
  }
}
