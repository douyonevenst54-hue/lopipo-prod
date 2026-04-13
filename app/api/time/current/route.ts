import { NextResponse } from 'next/server'

/**
 * GET /api/time/current
 * Returns authoritative server timestamp
 * Used by client to sync countdowns and prevent clock manipulation
 */
export async function GET() {
  try {
    const timestamp = new Date().toISOString()
    
    return NextResponse.json(
      { timestamp },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('[v0] Time API error:', err.message)
    return NextResponse.json({ error: 'Failed to get server time' }, { status: 500 })
  }
}
