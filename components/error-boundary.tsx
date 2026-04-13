'use client'

import React, { ReactNode, ReactElement } from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactElement
  componentName?: string
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error(`[ErrorBoundary] ${this.props.componentName || 'Component'} crashed:`, error)
    console.error('[ErrorBoundary] Error details:', errorInfo)

    // Update state
    this.setState({
      error,
      errorInfo,
    })

    // Call optional callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Report to monitoring service (e.g., Sentry)
    if (typeof window !== 'undefined' && window.__SENTRY__) {
      window.__SENTRY__.captureException(error)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="p-6 rounded-xl border border-red-500/30 bg-red-500/10 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-400 shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground">
                {this.props.componentName || 'Something went wrong'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {this.state.error?.message || 'An unexpected error occurred. Try refreshing.'}
              </p>
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-2 text-[10px] text-red-300">
                  <summary className="cursor-pointer font-mono">Details</summary>
                  <pre className="mt-1 p-2 bg-black/30 rounded overflow-auto max-h-40">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-red-500/40 hover:bg-red-500/60 transition-colors"
            >
              <RotateCcw size={12} />
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-foreground bg-muted/50 hover:bg-muted transition-colors"
            >
              <Home size={12} />
              Home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hooks-based error boundary for functional components
 * Usage: useErrorHandler(error)
 */
export function useErrorHandler(error: Error | null) {
  React.useEffect(() => {
    if (error) throw error
  }, [error])
}
