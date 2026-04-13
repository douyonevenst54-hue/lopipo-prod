// Environment Validation on Startup
// Fails loudly if critical env vars are missing
// Prevents silent failures in production

export interface RequiredEnvVars {
  name: string
  optional?: boolean
  description: string
}

const REQUIRED_ENV_VARS: RequiredEnvVars[] = [
  {
    name: 'DATABASE_URL',
    description: 'Neon PostgreSQL connection string for app data',
  },
  {
    name: 'PI_API_KEY',
    description: 'Pi Network API key for blockchain operations',
  },
  {
    name: 'VAPID_PUBLIC_KEY',
    description: 'Web Push VAPID public key for push notifications',
  },
  {
    name: 'VAPID_PRIVATE_KEY',
    description: 'Web Push VAPID private key for push notifications',
  },
  {
    name: 'UPSTASH_REDIS_REST_URL',
    optional: true,
    description: 'Upstash Redis URL for rate limiting and caching',
  },
  {
    name: 'UPSTASH_REDIS_REST_TOKEN',
    optional: true,
    description: 'Upstash Redis token for authentication',
  },
]

/**
 * Validate environment on startup
 * Call this in server root to catch config issues early
 */
export function validateEnvironment(): void {
  console.log('[Startup] Validating environment variables...')

  const missing: string[] = []
  const warnings: string[] = []

  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar.name]

    if (!value) {
      const msg = `Missing ${envVar.name}: ${envVar.description}`
      
      if (envVar.optional) {
        warnings.push(msg)
      } else {
        missing.push(msg)
      }
    } else {
      // Check for obviously invalid values
      if (envVar.name === 'DATABASE_URL' && !value.includes('postgres')) {
        missing.push(`Invalid DATABASE_URL format. Should be postgres:// connection string`)
      }
      
      if (envVar.name === 'PI_API_KEY' && value.length < 10) {
        missing.push(`Invalid PI_API_KEY format. Too short`)
      }
    }
  }

  // Report warnings
  if (warnings.length > 0) {
    console.warn('[Startup] Environment warnings:')
    warnings.forEach(w => console.warn(`  - ${w}`))
  }

  // Report and die if critical vars missing
  if (missing.length > 0) {
    console.error('[Startup] FATAL: Missing or invalid environment variables:')
    missing.forEach(m => console.error(`  - ${m}`))
    
    console.error('')
    console.error('[Startup] Application cannot start without these variables.')
    console.error('[Startup] Add them to Vercel Settings → Environment Variables')
    console.error('')
    
    // In production, fail hard
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    } else {
      console.warn('[Startup] Running in development mode, continuing anyway...')
    }
  }

  console.log('[Startup] Environment validation passed')
}

/**
 * Log configuration info (for debugging)
 */
export function logConfiguration(): void {
  console.log('')
  console.log('[Config] Application Configuration:')
  console.log(`  NODE_ENV: ${process.env.NODE_ENV}`)
  console.log(`  DATABASE_URL: ${process.env.DATABASE_URL?.substring(0, 30)}...`)
  console.log(`  PI_API_KEY: ${process.env.PI_API_KEY?.substring(0, 10)}...`)
  console.log(`  UPSTASH_REDIS: ${process.env.UPSTASH_REDIS_REST_URL ? 'Configured' : 'Not configured'}`)
  console.log(`  VAPID_PUBLIC_KEY: ${process.env.VAPID_PUBLIC_KEY ? 'Configured' : 'Not configured'}`)
  console.log('')
}

// Auto-validate on import (if in server environment)
if (typeof window === 'undefined') {
  if (process.env.NODE_ENV === 'production' || process.env.VALIDATE_ENV === 'true') {
    validateEnvironment()
    logConfiguration()
  }
}
