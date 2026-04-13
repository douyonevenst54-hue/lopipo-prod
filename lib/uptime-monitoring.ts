// Uptime Monitoring Configuration
// Send health checks to BetterUptime or UptimeRobot every 60 seconds
// Alert if app is down

export const UPTIME_MONITORS = {
  // BetterUptime configuration
  betterUptime: {
    enabled: !!process.env.BETTER_UPTIME_API_KEY,
    apiKey: process.env.BETTER_UPTIME_API_KEY,
    monitorId: process.env.BETTER_UPTIME_MONITOR_ID,
    heartbeatEndpoint: 'https://betterstack.com/api/v1/heartbeats/{monitor_id}',
    description: 'LoPiPo App Health Check',
  },

  // UptimeRobot configuration
  uptimeRobot: {
    enabled: !!process.env.UPTIMEROBOT_API_KEY,
    apiKey: process.env.UPTIMEROBOT_API_KEY,
    monitorId: process.env.UPTIMEROBOT_MONITOR_ID,
    heartbeatEndpoint: 'https://api.uptimerobot.com/v2/setStatusPageStatistic',
    description: 'LoPiPo Application',
  },

  // Vercel Analytics (built-in)
  vercel: {
    enabled: true,
    description: 'Using Vercel Web Analytics',
  },
}

/**
 * Send heartbeat to BetterUptime
 */
export async function sendBetterUptimeHeartbeat(healthStatus: boolean): Promise<void> {
  if (!UPTIME_MONITORS.betterUptime.enabled) return

  try {
    const endpoint = UPTIME_MONITORS.betterUptime.heartbeatEndpoint.replace(
      '{monitor_id}',
      UPTIME_MONITORS.betterUptime.monitorId || ''
    )

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPTIME_MONITORS.betterUptime.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: healthStatus ? 'up' : 'down',
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      console.warn(`[Monitoring] BetterUptime heartbeat failed: ${response.statusText}`)
    } else {
      console.log('[Monitoring] BetterUptime heartbeat sent')
    }
  } catch (error) {
    console.error('[Monitoring] BetterUptime heartbeat error:', error)
  }
}

/**
 * Send heartbeat to UptimeRobot
 */
export async function sendUptimeRobotHeartbeat(healthStatus: boolean): Promise<void> {
  if (!UPTIME_MONITORS.uptimeRobot.enabled) return

  try {
    const response = await fetch(UPTIME_MONITORS.uptimeRobot.heartbeatEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        api_key: UPTIME_MONITORS.uptimeRobot.apiKey || '',
        monitor_id: UPTIME_MONITORS.uptimeRobot.monitorId || '',
        status: healthStatus ? '1' : '0',
      }).toString(),
    })

    if (!response.ok) {
      console.warn(`[Monitoring] UptimeRobot heartbeat failed: ${response.statusText}`)
    } else {
      console.log('[Monitoring] UptimeRobot heartbeat sent')
    }
  } catch (error) {
    console.error('[Monitoring] UptimeRobot heartbeat error:', error)
  }
}

/**
 * Send heartbeats to all configured monitoring services
 */
export async function sendHealthbeatToAllMonitors(healthStatus: boolean): Promise<void> {
  console.log(`[Monitoring] Broadcasting health status: ${healthStatus ? 'UP' : 'DOWN'}`)

  await Promise.allSettled([
    sendBetterUptimeHeartbeat(healthStatus),
    sendUptimeRobotHeartbeat(healthStatus),
  ])
}

console.log('[Monitoring] Uptime monitoring configured')
console.log(`  BetterUptime: ${UPTIME_MONITORS.betterUptime.enabled ? 'Enabled' : 'Disabled'}`)
console.log(`  UptimeRobot: ${UPTIME_MONITORS.uptimeRobot.enabled ? 'Enabled' : 'Disabled'}`)
