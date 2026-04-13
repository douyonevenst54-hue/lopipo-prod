import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// Cast a vote on a paid poll
export async function POST(req: Request) {
  try {
    const { uid, pollId, optionId } = await req.json()

    if (!uid || !pollId || !optionId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user and poll
    const user = await sql`SELECT id FROM users WHERE uid = ${uid}`

    if (user.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const poll = await sql`SELECT id, entry_fee FROM paid_polls WHERE id = ${pollId} AND expires_at > NOW()`

    if (poll.length === 0) {
      return Response.json({ error: 'Poll not found or expired' }, { status: 404 })
    }

    // Check if user already voted
    const existing = await sql`
      SELECT id FROM paid_poll_votes 
      WHERE poll_id = ${pollId} AND voter_id = ${user[0].id}
    `

    if (existing.length > 0) {
      return Response.json({ error: 'You have already voted on this poll' }, { status: 400 })
    }

    // Record vote
    const vote = await sql`
      INSERT INTO paid_poll_votes (poll_id, voter_id, option_id, created_at)
      VALUES (${pollId}, ${user[0].id}, ${optionId}, NOW())
      RETURNING id
    `

    // TODO: Process Pi payment for entry_fee and distribute to creator and pool

    return Response.json(
      { 
        vote: vote[0],
        message: 'Vote recorded successfully'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Cast vote error:', error)
    return Response.json({ error: 'Failed to cast vote' }, { status: 500 })
  }
}

// Get poll votes/results
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const pollId = url.searchParams.get('pollId')

    if (!pollId) {
      return Response.json({ error: 'Missing pollId' }, { status: 400 })
    }

    const results = await sql`
      SELECT 
        ppo.id as option_id,
        ppo.label,
        ppo.emoji,
        COUNT(ppv.id) as vote_count
      FROM paid_poll_options ppo
      LEFT JOIN paid_poll_votes ppv ON ppo.id = ppv.option_id
      WHERE ppo.poll_id = ${pollId}
      GROUP BY ppo.id, ppo.label, ppo.emoji
      ORDER BY vote_count DESC
    `

    return Response.json({ results }, { status: 200 })
  } catch (error) {
    console.error('[v0] Get votes error:', error)
    return Response.json({ error: 'Failed to fetch votes' }, { status: 500 })
  }
}
