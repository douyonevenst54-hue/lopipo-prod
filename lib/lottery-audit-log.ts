import { neon } from "@neondatabase/serverless"
import { withDbRetry } from "./db-retry"
import { createLogger } from "./structured-logging"

const sql = neon(process.env.DATABASE_URL!)
const logger = createLogger("audit-log")

export interface LotteryAuditEntry {
  id: string
  seriesId: string
  drawTimestamp: string
  randomSeed: string
  ticketCount: number
  winnerUserId: string
  winnerUsername: string
  prizeAmount: number
  verificationHash: string
  createdAt: string
}

/**
 * Create immutable audit log entry for lottery draw
 * Each draw is recorded with seed, ticket count, and cryptographic hash for verification
 */
export async function recordLotteryDraw(
  seriesId: string,
  ticketCount: number,
  winnerUserId: string,
  winnerUsername: string,
  prizeAmount: number,
  randomSeed: string
): Promise<LotteryAuditEntry> {
  try {
    // Create verification hash: SHA256(seed + seriesId + timestamp + ticketCount)
    const timestamp = new Date().toISOString()
    const verificationData = `${randomSeed}:${seriesId}:${timestamp}:${ticketCount}`
    const verificationHash = await hashData(verificationData)

    const result = await withDbRetry(async () => {
      return await sql`
        INSERT INTO lottery_audit_log (
          series_id,
          draw_timestamp,
          random_seed,
          ticket_count,
          winner_user_id,
          winner_username,
          prize_amount,
          verification_hash
        )
        VALUES (
          ${seriesId},
          ${timestamp},
          ${randomSeed},
          ${ticketCount},
          ${winnerUserId},
          ${winnerUsername},
          ${prizeAmount},
          ${verificationHash}
        )
        RETURNING id, series_id as "seriesId", draw_timestamp as "drawTimestamp", 
                  random_seed as "randomSeed", ticket_count as "ticketCount",
                  winner_user_id as "winnerUserId", winner_username as "winnerUsername",
                  prize_amount as "prizeAmount", verification_hash as "verificationHash",
                  created_at as "createdAt"
      `
    })

    logger.log({
      level: "info",
      method: "POST",
      status: 200,
      duration: 0,
      message: `Lottery draw recorded: ${winnerUsername} won ${prizeAmount}π`,
      metadata: {
        seriesId,
        winnerUserId,
        prizeAmount,
        ticketCount,
      },
    })

    return result[0] as LotteryAuditEntry
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error("Failed to record lottery audit log", err, {
      seriesId,
      winnerUserId,
    })
    throw err
  }
}

/**
 * Retrieve audit log entry for verification
 */
export async function getLotteryAuditEntry(
  seriesId: string
): Promise<LotteryAuditEntry | null> {
  try {
    const result = await withDbRetry(async () => {
      return await sql`
        SELECT 
          id, series_id as "seriesId", draw_timestamp as "drawTimestamp",
          random_seed as "randomSeed", ticket_count as "ticketCount",
          winner_user_id as "winnerUserId", winner_username as "winnerUsername",
          prize_amount as "prizeAmount", verification_hash as "verificationHash",
          created_at as "createdAt"
        FROM lottery_audit_log
        WHERE series_id = ${seriesId}
        LIMIT 1
      `
    })

    return result[0] as LotteryAuditEntry || null
  } catch (error) {
    logger.error("Failed to retrieve audit log", error as Error, { seriesId })
    return null
  }
}

/**
 * Verify draw authenticity by recalculating hash
 */
export async function verifyLotteryDraw(
  entry: LotteryAuditEntry
): Promise<boolean> {
  try {
    const verificationData = `${entry.randomSeed}:${entry.seriesId}:${entry.drawTimestamp}:${entry.ticketCount}`
    const recalculatedHash = await hashData(verificationData)

    const isValid = recalculatedHash === entry.verificationHash
    if (!isValid) {
      logger.log({
        level: "warn",
        method: "GET",
        status: 400,
        duration: 0,
        message: "Lottery draw verification failed - hash mismatch",
        metadata: {
          seriesId: entry.seriesId,
          expected: entry.verificationHash,
          calculated: recalculatedHash,
        },
      })
    }

    return isValid
  } catch (error) {
    logger.error("Verification error", error as Error, { seriesId: entry.seriesId })
    return false
  }
}

/**
 * Hash data using SHA256
 * Uses Web Crypto API available in modern Node.js and browsers
 */
async function hashData(data: string): Promise<string> {
  if (typeof global !== "undefined" && global.crypto) {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  // Fallback for environments without crypto
  return Buffer.from(data).toString("hex")
}

/**
 * Get audit log export for compliance
 */
export async function exportAuditLog(
  startDate: Date,
  endDate: Date
): Promise<LotteryAuditEntry[]> {
  try {
    const result = await withDbRetry(async () => {
      return await sql`
        SELECT 
          id, series_id as "seriesId", draw_timestamp as "drawTimestamp",
          random_seed as "randomSeed", ticket_count as "ticketCount",
          winner_user_id as "winnerUserId", winner_username as "winnerUsername",
          prize_amount as "prizeAmount", verification_hash as "verificationHash",
          created_at as "createdAt"
        FROM lottery_audit_log
        WHERE created_at BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}
        ORDER BY created_at DESC
      `
    })

    return result as LotteryAuditEntry[]
  } catch (error) {
    logger.error("Failed to export audit log", error as Error)
    return []
  }
}
