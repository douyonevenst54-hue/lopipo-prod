/**
 * Centralized API error handling and logging
 * Ensures consistent error responses and tracks issues
 */

import { NextResponse, type NextRequest } from "next/server"

export interface ApiErrorContext {
  route: string
  method: string
  userId?: string
  error: Error | string
  statusCode?: number
}

/**
 * Logs API errors with context for debugging
 */
export function logApiError(context: ApiErrorContext) {
  const timestamp = new Date().toISOString()
  const errorMessage = context.error instanceof Error ? context.error.message : String(context.error)
  const errorStack = context.error instanceof Error ? context.error.stack : undefined

  console.error(
    JSON.stringify({
      type: "API_ERROR",
      timestamp,
      route: context.route,
      method: context.method,
      userId: context.userId,
      statusCode: context.statusCode || 500,
      message: errorMessage,
      stack: errorStack,
    })
  )
}

/**
 * Returns standardized error response
 */
export function errorResponse(
  error: Error | string,
  statusCode: number = 500,
  context?: Partial<ApiErrorContext>
) {
  if (context) {
    logApiError({ ...context, error, statusCode } as ApiErrorContext)
  }

  const isProduction = process.env.NODE_ENV === "production"
  const message = error instanceof Error ? error.message : String(error)

  return NextResponse.json(
    {
      error: isProduction ? "Internal server error" : message,
      statusCode,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  )
}

/**
 * Wraps async API handlers with error boundary
 */
export function withErrorHandler(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      return await handler(req)
    } catch (error) {
      const pathname = req.nextUrl.pathname
      const method = req.method

      logApiError({
        route: pathname,
        method,
        error: error instanceof Error ? error : new Error(String(error)),
        statusCode: 500,
      })

      return errorResponse(error, 500, {
        route: pathname,
        method,
      })
    }
  }
}

/**
 * Validates required environment variables
 */
export function validateEnv(...keys: string[]): void {
  const missing = keys.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`)
  }
}

/**
 * Validates required request body fields
 */
export function validateRequestBody<T extends Record<string, unknown>>(
  body: unknown,
  requiredFields: (keyof T)[]
): asserts body is T {
  if (!body || typeof body !== "object") {
    throw new Error("Request body is required")
  }

  const bodyObj = body as Record<string, unknown>
  const missing = requiredFields.filter((field) => !(field in bodyObj))

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${String(missing.join(", "))}`)
  }
}
