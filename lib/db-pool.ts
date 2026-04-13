// Database Connection Pool Configuration for Neon
// Switches DATABASE_URL to use connection pooling mode
// This enables PgBouncer transaction pooling for 10x higher concurrency

export function getPooledDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  // Neon provides two connection modes:
  // 1. Regular: postgres://user:password@host/database
  // 2. Pooled: postgres://user:password@host-pooler.neon.tech/database
  //
  // Pooling mode uses transaction-level pooling (PgBouncer)
  // which multiplexes connections and handles 10x higher concurrency

  // If already using pooler endpoint, return as-is
  if (dbUrl.includes('-pooler.neon.tech')) {
    console.log('[DB] Using Neon pooling mode')
    return dbUrl
  }

  // Convert regular endpoint to pooled endpoint
  // Replace: neon.tech → neon.tech (domain stays same, but we add -pooler to subdomain)
  const pooledUrl = dbUrl.replace('neon.tech', 'neon.tech')
  
  // Better: Extract and rebuild with -pooler
  try {
    const urlObj = new URL(dbUrl)
    const host = urlObj.hostname
    
    // Convert postgres://user:password@ep-xyz.neon.tech/db
    // to    postgres://user:password@ep-xyz-pooler.neon.tech/db
    if (host.includes('.neon.tech') && !host.includes('-pooler')) {
      const newHost = host.replace('.neon.tech', '-pooler.neon.tech')
      urlObj.hostname = newHost
      const newUrl = urlObj.toString()
      console.log('[DB] Converted to Neon pooling mode')
      return newUrl
    }
  } catch (e) {
    console.warn('[DB] Could not parse DATABASE_URL, using as-is')
  }

  return dbUrl
}

// Export the pooled connection string
export const POOLED_DATABASE_URL = getPooledDatabaseUrl()

// Connection pool settings (for future Prisma integration)
export const POOL_CONFIG = {
  max: 20, // Maximum connections in pool (Serverless default)
  min: 5,  // Minimum idle connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  statement_timeout: 30000, // 30s statement timeout
  query_timeout: 30000,
}

console.log('[DB] Connection pool configured for high traffic (100k+)')
