// Rate Limiting Middleware using Upstash Redis
// Prevents spam on critical endpoints: 10 requests per user per minute
// Protects against: lottery spam, poll voting loops, referral abuse

import { NextRequest, NextResponse } from 'next/server'

// Upstash Redis configuration
const UPSTASH_REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

export interface RateLimitConfig {
  requests: number      // Maximum requests
  windowMs: number      // Time window in milliseconds
  keyPrefix?: string    // Redis key prefix
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

// Default rate limit: 10 requests per 60 seconds per user
export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  requests: 10,
  windowMs: 60 * 1000,
  keyPrefix: 'ratelimit:',
}

// Strict limits for sensitive endpoints
export const STRICT_RATE_LIMIT: RateLimitConfig = {
  requests: 5,
  windowMs: 60 * 1000,
  keyPrefix: 'ratelimit:strict:',
}

// Loose limits for read operations
export const LOOSE_RATE_LIMIT: RateLimitConfig = {
  requests: 30,
  windowMs: 60 * 1000,
  keyPrefix: 'ratelimit:loose:',
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

/**
 * Check rate limit for a user/endpoint
 */
export async function checkRateLimit(
  identifier: string, // user ID or IP
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): Promise<RateLimitResult> {
  if (!UPSTASH_REDIS_URL || !UPSTASH_REDIS_TOKEN) {
    console.warn('[RateLimit] Upstash Redis not configured, skipping rate limit check')
    return { success: true, remaining: config.requests, resetTime: Date.now() + config.windowMs }
  }

  const key = `${config.keyPrefix}${identifier}`
  const now = Date.now()
  const windowStart = now - config.windowMs

  try {
    // Use ZREMRANGEBYSCORE to remove old entries outside the window
    await redisCall('ZREMRANGEBYSCORE', [key, '0', String(windowStart)])

    // Count requests in current window
    const countResult = await redisCall('ZCARD', [key])
    const count = parseInt(countResult?.[0] || '0', 10)

    if (count >= config.requests) {
      // Rate limit exceeded
      const oldestEntry = await redisCall('ZRANGE', [key, '0', '0'])
      const oldestTime = oldestEntry?.[0] ? parseInt(oldestEntry[0], 10) : now
      const resetTime = oldestTime + config.windowMs
      const retryAfter = Math.ceil((resetTime - now) / 1000)

      return {
        success: false,
        remaining: 0,
        resetTime,
        retryAfter,
      }
    }

    // Add current request to the window
    await redisCall('ZADD', [key, String(now), String(now)])
    // Set expiration
    await redisCall('EXPIRE', [key, String(Math.ceil(config.windowMs / 1000))])

    return {
      success: true,
      remaining: config.requests - count - 1,
      resetTime: now + config.windowMs,
    }
  } catch (error) {
    console.error('[RateLimit] Error checking rate limit:', error)
    // Fail open: allow request if Redis is down
    return { success: true, remaining: config.requests, resetTime: Date.now() + config.windowMs }
  }
}

/**
 * Make a call to Upstash Redis REST API
 */
async function redisCall(command: string, args: string[]): Promise<any> {
  const url = new URL(UPSTASH_REDIS_URL!)
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${UPSTASH_REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      command,
      args,
    }),
  })

  if (!response.ok) {
    throw new Error(`Redis call failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data.result
}

/**
 * Next.js middleware wrapper for rate limiting
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): Promise<NextResponse | null> {
  // Get user identifier
  const identifier = request.headers.get('x-user-id') || 
                    request.headers.get('x-forwarded-for') || 
                    'anonymous'

  const result = await checkRateLimit(identifier, config)

  // Add rate limit headers to response
  const headers = new Headers()
  headers.set('X-RateLimit-Limit', String(config.requests))
  headers.set('X-RateLimit-Remaining', String(result.remaining))
  headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetTime / 1000)))

  if (!result.success) {
    headers.set('Retry-After', String(result.retryAfter))
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',
        retryAfter: result.retryAfter,
      }),
      {
        status: 429,
        headers,
      }
    )
  }

  return null
}

/**
 * Helper to get endpoint-specific rate limit
 */
export function getRateLimitConfig(endpoint: string): RateLimitConfig {
  // Strict: payment and lottery endpoints
  if (endpoint.includes('/lottery/purchase') || 
      endpoint.includes('/subscription/create') ||
      endpoint.includes('/polls/feature')) {
    return STRICT_RATE_LIMIT
  }

  // Loose: read operations
  if (endpoint.includes('/leaderboard') || 
      endpoint.includes('/health')) {
    return LOOSE_RATE_LIMIT
  }

  // Default: most endpoints
  return DEFAULT_RATE_LIMIT
}
