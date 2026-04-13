import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// Get available ad slots
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const placement = url.searchParams.get('placement') || 'home'

    // Get active ads for placement
    const ads = await sql`
      SELECT 
        id,
        title,
        description,
        image_url,
        cta_text,
        cta_link,
        placement,
        impression_count,
        click_count,
        created_at
      FROM ads
      WHERE placement = ${placement} 
      AND status = 'active' 
      AND expires_at > NOW()
      ORDER BY RANDOM()
      LIMIT 1
    `

    if (ads.length === 0) {
      return Response.json({ ad: null }, { status: 200 })
    }

    return Response.json({ ad: ads[0] }, { status: 200 })
  } catch (error) {
    console.error('[v0] Get ads error:', error)
    return Response.json({ error: 'Failed to fetch ads' }, { status: 500 })
  }
}

// Create an ad (admin only)
export async function POST(req: Request) {
  try {
    const { apiKey, title, description, imageUrl, ctaText, ctaLink, placement, budget } = await req.json()

    // Verify API key (should be in environment)
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ad = await sql`
      INSERT INTO ads (title, description, image_url, cta_text, cta_link, placement, budget, status, created_at, expires_at)
      VALUES (${title}, ${description}, ${imageUrl}, ${ctaText}, ${ctaLink}, ${placement || 'home'}, ${budget}, 'active', NOW(), NOW() + INTERVAL '30 days')
      RETURNING id, title, budget
    `

    return Response.json(
      { 
        ad: ad[0],
        message: 'Ad created successfully'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Create ad error:', error)
    return Response.json({ error: 'Failed to create ad' }, { status: 500 })
  }
}
