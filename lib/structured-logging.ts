import { NextRequest, NextResponse } from "next/server"

export interface LogEntry {
  timestamp: string
  level: "info" | "warn" | "error" | "debug"
  route: string
  method: string
  userId?: string
  duration: number
  status: number
  message: string
  error?: string
  metadata?: Record<string, unknown>
}

/**
 * Structured logging utility for API routes
 * Logs: caller, duration, status, errors
 * Integrates with Vercel logs and Axiom
 */
export function createLogger(route: string) {
  return {
    log: (entry: Omit<LogEntry, "timestamp" | "route">) => {
      const logEntry: LogEntry = {
        ...entry,
        timestamp: new Date().toISOString(),
        route,
      }

      // Output to stdout for Vercel log drains
      console.log(JSON.stringify(logEntry))

      // Send to Axiom if configured
      if (process.env.AXIOM_DATASET && process.env.AXIOM_API_TOKEN) {
        sendToAxiom(logEntry).catch((err) =>
          console.error("[v0] Axiom logging error:", err.message)
        )
      }

      return logEntry
    },

    error: (message: string, err: Error, metadata?: Record<string, unknown>) => {
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        route,
        level: "error",
        message,
        error: err.message,
        stack: err.stack,
        metadata,
      }))
    },
  }
}

/**
 * Middleware to log all API requests and their performance
 */
export async function logApiRequest(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  const startTime = Date.now()
  const route = new URL(req.url).pathname
  const method = req.method
  const userId = req.headers.get("x-user-id")

  try {
    const response = await handler(req)
    const duration = Date.now() - startTime

    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "info",
      route,
      method,
      userId,
      status: response.status,
      duration,
      message: `${method} ${route} completed`,
    }))

    return response
  } catch (error) {
    const duration = Date.now() - startTime
    const err = error instanceof Error ? error : new Error(String(error))

    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      route,
      method,
      userId,
      duration,
      status: 500,
      message: `${method} ${route} failed`,
      error: err.message,
      stack: err.stack,
    }))

    throw error
  }
}

/**
 * Send logs to Axiom for centralized logging
 */
async function sendToAxiom(entry: LogEntry) {
  try {
    await fetch("https://api.axiom.co/v1/datasets/lopipo/ingest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AXIOM_API_TOKEN}`,
      },
      body: JSON.stringify([entry]),
    })
  } catch (err) {
    console.error("[v0] Failed to send log to Axiom:", err)
  }
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}
