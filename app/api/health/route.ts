/**
 * Health check endpoint for Vercel monitoring
 * Pings Neon database and returns system status
 */

import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  const startTime = Date.now()
  const checks = {
    database: false,
    uptime: true,
    timestamp: new Date().toISOString(),
    responseTime: 0,
  }

  try {
    // Test database connection with simple query
    await sql`SELECT 1`
    checks.database = true
  } catch (error) {
    console.error("[Health] Database check failed:", error)
    checks.database = false

    return NextResponse.json(
      {
        status: "degraded",
        ...checks,
        responseTime: Date.now() - startTime,
        message: "Database unavailable",
      },
      { status: 503 }
    )
  }

  checks.responseTime = Date.now() - startTime

  return NextResponse.json(
    {
      status: "healthy",
      ...checks,
      uptime: process.uptime(),
    },
    { status: 200 }
  )
}
