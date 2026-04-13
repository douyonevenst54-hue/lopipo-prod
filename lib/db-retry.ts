/**
 * Database retry utility with exponential backoff
 * Handles transient Neon connection failures gracefully
 */

export interface RetryOptions {
  maxAttempts?: number
  initialDelayMs?: number
  maxDelayMs?: number
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
}

/**
 * Executes a database operation with exponential backoff retry logic
 * @param operation - Async function that performs the database operation
 * @param options - Retry configuration
 * @returns Result of the operation or throws after max attempts
 */
export async function withDbRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = DEFAULT_RETRY_OPTIONS
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? DEFAULT_RETRY_OPTIONS.maxAttempts!
  const initialDelayMs = options.initialDelayMs ?? DEFAULT_RETRY_OPTIONS.initialDelayMs!
  const maxDelayMs = options.maxDelayMs ?? DEFAULT_RETRY_OPTIONS.maxDelayMs!

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[DB] Attempt ${attempt}/${maxAttempts}`)
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if error is retryable
      const isRetryable = isRetryableDbError(lastError)
      if (!isRetryable || attempt === maxAttempts) {
        console.error(`[DB] Non-retryable or final attempt failed:`, lastError.message)
        throw lastError
      }

      // Calculate exponential backoff delay
      const delay = Math.min(initialDelayMs * Math.pow(2, attempt - 1), maxDelayMs)
      console.warn(`[DB] Retrying in ${delay}ms after: ${lastError.message}`)
      await sleep(delay)
    }
  }

  throw lastError || new Error("Database operation failed")
}

/**
 * Determines if a database error is retryable
 */
function isRetryableDbError(error: Error): boolean {
  const message = error.message.toLowerCase()
  const retryablePatterns = [
    "timeout",
    "econnrefused",
    "enotfound",
    "pool",
    "connection",
    "unavailable",
    "temporarily",
    "too many connections",
  ]

  return retryablePatterns.some((pattern) => message.includes(pattern))
}

/**
 * Utility sleep function
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Wraps error responses for API routes
 */
export function dbErrorResponse(error: Error, statusCode: number = 500) {
  const isRetryable = isRetryableDbError(error)
  return {
    error: error.message,
    retryable: isRetryable,
    statusCode,
    timestamp: new Date().toISOString(),
  }
}
