import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'
import { withDbRetry } from '@/lib/db-retry'
import { errorResponse, validateRequestBody } from '@/lib/api-errors'

const sql = neon(process.env.DATABASE_URL!)

interface ShareTrackRequest {
  pollId?: string
  ticketId?: string
  sharedBy: string
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json()
    validateRequestBody<ShareTrackRequest>(body, ['sharedBy'])

    const { pollId, ticketId, sharedBy } = body as ShareTrackRequest

    if (!pollId && !ticketId) {
      return NextResponse.json(
        { error: 'pollId or ticketId required' },
        { status: 400 }
      )
    }

    const shareLink = await withDbRetry(async () => {
      return await sql`
        INSERT INTO share_links (poll_id, ticket_id, shared_by, created_at)
        VALUES (${pollId || null}, ${ticketId || null}, ${sharedBy}, NOW())
        RETURNING id, poll_id, ticket_id
      `
    })

    const shareCode = Buffer.from(
      `${shareLink?.[0]?.id}:${sharedBy}`
    ).toString('base64')

    return NextResponse.json(
      {
        shareCode,
        shareUrl: `https://www.LoPiPo.app?ref=${shareCode}`,
      },
      { status: 201 }
    )
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    return errorResponse(err, 500)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shareCode = searchParams.get('code')

    if (!shareCode) {
      return NextResponse.json({ error: 'code required' }, { status: 400 })
    }

    const decoded = Buffer.from(shareCode, 'base64').toString('utf-8')
    const [linkId, sharedBy] = decoded.split(':')

    const link = await withDbRetry(async () => {
      return await sql`
        SELECT poll_id, ticket_id, shared_by FROM share_links
        WHERE id = ${linkId}
        LIMIT 1
      `
    })

    if (!link || link.length === 0) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    return NextResponse.json({ link: link[0] })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    return errorResponse(err, 500)
  }
}
