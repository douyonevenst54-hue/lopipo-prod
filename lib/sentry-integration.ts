import * as Sentry from "@sentry/nextjs"

export function initSentry() {
  if (!process.env.SENTRY_DSN) {
    console.warn("[v0] SENTRY_DSN not set - RUM disabled")
    return
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    integrations: [
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  })
}

/**
 * Capture user action with context
 */
export function captureUserAction(
  action: string,
  metadata?: Record<string, unknown>
) {
  Sentry.captureMessage(`User Action: ${action}`, "info", {
    tags: {
      action,
    },
    extra: metadata,
  })
}

/**
 * Track page performance
 */
export function trackPagePerformance(pathname: string) {
  if (typeof window === "undefined") return

  window.addEventListener("load", () => {
    const perfData = window.performance.timing
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart

    Sentry.captureMessage("Page Load", "info", {
      tags: {
        page: pathname,
      },
      extra: {
        loadTime: `${pageLoadTime}ms`,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        firstPaint: perfData.responseStart - perfData.navigationStart,
      },
    })
  })
}

/**
 * Set user context for error tracking
 */
export function setSentryUser(userId: string, metadata?: Record<string, unknown>) {
  Sentry.setUser({
    id: userId,
    ...metadata,
  })
}

/**
 * Clear user context on logout
 */
export function clearSentryUser() {
  Sentry.setUser(null)
}
