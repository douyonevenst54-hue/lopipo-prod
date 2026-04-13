import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// Create a paid poll
export async function POST(req: Request) {
  try {
    const { uid, title, options, entryFee, creatorReward } = await req.json()

    if (!uid || !title || !options || !entryFee) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user
    const user = await sql`SELECT id FROM users WHERE uid = ${uid}`

    if (user.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Create paid poll
    const poll = await sql`
      INSERT INTO paid_polls (creator_id, title, entry_fee, creator_reward, expires_at, created_at)
      VALUES (${user[0].id}, ${title}, ${entryFee}, ${creatorReward || 0}, NOW() + INTERVAL '24 hours', NOW())
      RETURNING id, title, entry_fee
    `

    // Create poll options
    for (const option of options) {
      await sql`
        INSERT INTO paid_poll_options (poll_id, label, emoji)
        VALUES (${poll[0].id}, ${option.label}, ${option.emoji})
      `
    }

    return Response.json(
      { 
        poll: poll[0],
        message: 'Paid poll created successfully'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Create paid poll error:', error)
    return Response.json({ error: 'Failed to create paid poll' }, { status: 500 })
  }
}

// Get active paid polls
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const pollId = url.searchParams.get('id')

    if (pollId) {
      // Get specific poll
      const poll = await sql`
        SELECT 
          pp.id, pp.title, pp.entry_fee, pp.creator_reward,
          COUNT(DISTINCT ppo.id) as option_count,
          COUNT(DISTINCT ppv.id) as total_votes
        FROM paid_polls pp
        LEFT JOIN paid_poll_options ppo ON pp.id = ppo.poll_id
        LEFT JOIN paid_poll_votes ppv ON pp.id = ppv.poll_id
        WHERE pp.id = ${pollId} AND pp.expires_at > NOW()
        GROUP BY pp.id
      `

      if (poll.length === 0) {
        return Response.json({ error: 'Poll not found' }, { status: 404 })
      }

      return Response.json({ poll: poll[0] }, { status: 200 })
    }

    // Get all active paid polls
    const polls = await sql`
      SELECT 
        pp.id, pp.title, pp.entry_fee, pp.creator_reward,
        COUNT(DISTINCT ppo.id) as option_count,
        COUNT(DISTINCT ppv.id) as total_votes
      FROM paid_polls pp
      LEFT JOIN paid_poll_options ppo ON pp.id = ppo.poll_id
      LEFT JOIN paid_poll_votes ppv ON pp.id = ppv.poll_id
      WHERE pp.expires_at > NOW()
      GROUP BY pp.id
      ORDER BY pp.created_at DESC
      LIMIT 20
    `

    return Response.json({ polls }, { status: 200 })
  } catch (error) {
    console.error('[v0] Get paid polls error:', error)
    return Response.json({ error: 'Failed to fetch polls' }, { status: 500 })
  }
}
