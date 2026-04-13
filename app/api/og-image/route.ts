import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'lottery'
    const title = searchParams.get('title') || 'Win Real Pi on LoPiPo'
    const prizePool = searchParams.get('prize') || '100π'
    const participants = searchParams.get('participants') || '1000+'

    // Generate SVG-based OG image (no external dependencies needed)
    const svgImage = generateOGImage(type, title, prizePool, participants)

    // Convert SVG to PNG using dataURL (for simple cases)
    // For production, use a service like Vercel OG Image Generation or Cloudinary
    return new NextResponse(svgImage, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('[v0] OG image generation error:', error)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}

function generateOGImage(type: string, title: string, prizePool: string, participants: string): string {
  const width = 1200
  const height = 630

  const bgColor = type === 'poll' ? '#1E40AF' : '#DC2626'
  const accentColor = type === 'poll' ? '#60A5FA' : '#FCD34D'

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0F131A;stop-opacity:1" />
          <stop offset="100%" style="stop-color:${bgColor};stop-opacity:0.3" />
        </linearGradient>
      </defs>
      
      <rect width="${width}" height="${height}" fill="url(#grad)"/>
      
      <!-- Accent circle -->
      <circle cx="${width - 100}" cy="${height - 100}" r="150" fill="${accentColor}" opacity="0.1"/>
      <circle cx="100" cy="100" r="100" fill="${accentColor}" opacity="0.15"/>
      
      <!-- Logo/Title -->
      <text x="60" y="100" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#FFFFFF">
        LoPiPo
      </text>
      
      <!-- Main title -->
      <text x="60" y="200" font-family="Arial, sans-serif" font-size="56" font-weight="bold" fill="#FFFFFF" text-anchor="start">
        <tspan x="60" dy="0">${title.substring(0, 30)}</tspan>
        ${title.length > 30 ? `<tspan x="60" dy="60">${title.substring(30)}</tspan>` : ''}
      </text>
      
      <!-- Stats section -->
      <rect x="60" y="380" width="1080" height="180" fill="#FFFFFF" opacity="0.05" rx="20"/>
      
      <!-- Prize pool -->
      <text x="100" y="430" font-family="Arial, sans-serif" font-size="24" fill="${accentColor}" font-weight="bold">
        Prize Pool
      </text>
      <text x="100" y="480" font-family="Arial, sans-serif" font-size="40" fill="#FFFFFF" font-weight="bold">
        ${prizePool}
      </text>
      
      <!-- Participants -->
      <text x="500" y="430" font-family="Arial, sans-serif" font-size="24" fill="${accentColor}" font-weight="bold">
        Players
      </text>
      <text x="500" y="480" font-family="Arial, sans-serif" font-size="40" fill="#FFFFFF" font-weight="bold">
        ${participants}
      </text>
      
      <!-- CTA -->
      <text x="900" y="440" font-family="Arial, sans-serif" font-size="28" fill="#FFFFFF" text-anchor="end" font-weight="bold">
        Join Now
      </text>
      <text x="900" y="490" font-family="Arial, sans-serif" font-size="18" fill="#CCCCCC" text-anchor="end">
        www.LoPiPo.app
      </text>
    </svg>
  `
}
