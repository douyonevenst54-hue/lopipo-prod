// Payment Idempotency System
// Prevents duplicate charges if server crashes mid-transaction
// Uses Upstash Redis to track idempotency keys for 24 hours

import { nanoid } from 'nanoid'

const UPSTASH_REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const IDEMPOTENCY_TTL = 86400 // 24 hours

export interface IdempotencyKey {
  key: string
  timestamp: number
  status: 'pending' | 'completed' | 'failed'
  result?: any
  error?: string
}

/**
 * Generate a new idempotency key for a payment request
 */
export function generateIdempotencyKey(): string {
  return `idem_${nanoid(24)}`
}

/**
 * Register an idempotency key for a transaction
 * Returns true if this is a NEW request, false if DUPLICATE
 */
export async function registerIdempotencyKey(
  key: string,
  userId: string
): Promise<boolean> {
  if (!UPSTASH_REDIS_URL || !UPSTASH_REDIS_TOKEN) {
    console.warn('[Idempotency] Redis not configured, skipping check')
    return true // Fail open
  }

  try {
    const redisKey = `idempotency:${userId}:${key}`
    
    // Try to set the key (only succeeds if it doesn't exist)
    const response = await fetch(new URL(UPSTASH_REDIS_URL), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPSTASH_REDIS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: 'SET',
        args: [redisKey, JSON.stringify({
          status: 'pending',
          timestamp: Date.now(),
        }), 'NX', 'EX', String(IDEMPOTENCY_TTL)],
      }),
    })

    const data = await response.json()
    
    // data.result === "OK" means key was SET (new request)
    // data.result === null means key already existed (duplicate)
    const isNewRequest = data.result === 'OK'
    
    console.log(`[Idempotency] ${isNewRequest ? 'New' : 'Duplicate'} request - Key: ${key}`)
    return isNewRequest
  } catch (error) {
    console.error('[Idempotency] Error registering key:', error)
    return true // Fail open on Redis error
  }
}

/**
 * Mark idempotency key as completed with result
 */
export async function completeIdempotency(
  key: string,
  userId: string,
  result: any
): Promise<void> {
  if (!UPSTASH_REDIS_URL || !UPSTASH_REDIS_TOKEN) return

  try {
    const redisKey = `idempotency:${userId}:${key}`
    
    await fetch(new URL(UPSTASH_REDIS_URL), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPSTASH_REDIS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: 'SET',
        args: [
          redisKey,
          JSON.stringify({
            status: 'completed',
            timestamp: Date.now(),
            result,
          }),
          'EX',
          String(IDEMPOTENCY_TTL),
        ],
      }),
    })
    
    console.log(`[Idempotency] Marked completed - Key: ${key}`)
  } catch (error) {
    console.error('[Idempotency] Error marking complete:', error)
  }
}

/**
 * Mark idempotency key as failed
 */
export async function failIdempotency(
  key: string,
  userId: string,
  error: Error
): Promise<void> {
  if (!UPSTASH_REDIS_URL || !UPSTASH_REDIS_TOKEN) return

  try {
    const redisKey = `idempotency:${userId}:${key}`
    
    await fetch(new URL(UPSTASH_REDIS_URL), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPSTASH_REDIS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: 'SET',
        args: [
          redisKey,
          JSON.stringify({
            status: 'failed',
            timestamp: Date.now(),
            error: error.message,
          }),
          'EX',
          String(IDEMPOTENCY_TTL),
        ],
      }),
    })
    
    console.log(`[Idempotency] Marked failed - Key: ${key}`)
  } catch (err) {
    console.error('[Idempotency] Error marking failed:', err)
  }
}

/**
 * Retrieve previous result for duplicate idempotency key
 */
export async function getIdempotencyResult(
  key: string,
  userId: string
): Promise<IdempotencyKey | null> {
  if (!UPSTASH_REDIS_URL || !UPSTASH_REDIS_TOKEN) return null

  try {
    const redisKey = `idempotency:${userId}:${key}`
    
    const response = await fetch(new URL(UPSTASH_REDIS_URL), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPSTASH_REDIS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: 'GET',
        args: [redisKey],
      }),
    })

    const data = await response.json()
    
    if (data.result) {
      const cached = JSON.parse(data.result)
      console.log(`[Idempotency] Found cached result for key: ${key}`)
      return {
        key,
        ...cached,
      }
    }
    
    return null
  } catch (error) {
    console.error('[Idempotency] Error retrieving result:', error)
    return null
  }
}

/**
 * Middleware for payment endpoints
 * Usage: Add idempotency-key header to payment requests
 */
export async function withIdempotency(
  request: Request,
  userId: string,
  handler: (isNewRequest: boolean) => Promise<Response>
): Promise<Response> {
  const idempotencyKey = request.headers.get('idempotency-key')
  
  if (!idempotencyKey) {
    return new Response(
      JSON.stringify({ error: 'idempotency-key header required' }),
      { status: 400 }
    )
  }

  // Check if this is a new request
  const isNewRequest = await registerIdempotencyKey(idempotencyKey, userId)
  
  if (!isNewRequest) {
    // This is a duplicate - retrieve and return cached result
    const cached = await getIdempotencyResult(idempotencyKey, userId)
    
    if (cached?.status === 'completed') {
      return new Response(
        JSON.stringify({
          message: 'Duplicate request - returning cached result',
          result: cached.result,
          idempotencyKey,
        }),
        { status: 200 }
      )
    }
    
    if (cached?.status === 'pending') {
      return new Response(
        JSON.stringify({
          error: 'Request already in progress',
          idempotencyKey,
        }),
        { status: 409 }
      )
    }
    
    if (cached?.status === 'failed') {
      return new Response(
        JSON.stringify({
          error: 'Previous request failed',
          message: cached.error,
          idempotencyKey,
        }),
        { status: 400 }
      )
    }
  }

  // Process new request
  try {
    const response = await handler(isNewRequest)
    const responseData = await response.json()
    
    await completeIdempotency(idempotencyKey, userId, responseData)
    
    return new Response(
      JSON.stringify({
        ...responseData,
        idempotencyKey,
      }),
      {
        status: response.status,
        headers: {
          ...Object.fromEntries(response.headers),
          'Idempotency-Key': idempotencyKey,
        },
      }
    )
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    await failIdempotency(idempotencyKey, userId, err)
    
    return new Response(
      JSON.stringify({
        error: err.message,
        idempotencyKey,
      }),
      { status: 500 }
    )
  }
}

console.log('[Idempotency] Payment idempotency system initialized')
