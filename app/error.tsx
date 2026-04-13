"use client"

import Link from "next/link"
import { Home, AlertTriangle, RefreshCw, HeartHandshake } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/30">
            <AlertTriangle size={40} className="text-red-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-5xl font-syne font-bold text-foreground">500</h1>
          <p className="text-lg font-syne font-semibold text-muted-foreground">
            Oops! Something Went Wrong
          </p>
          <p className="text-sm text-muted-foreground">
            We encountered an unexpected error. Don&apos;t worry, your Pi is safe and no transactions were made.
          </p>
        </div>

        {/* Pi Network context message */}
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 backdrop-blur-sm p-4">
          <div className="flex items-start gap-2">
            <HeartHandshake size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground text-left">
              Your wallet and Pi are protected. All transactions require your explicit approval. Try refreshing or contact support if the issue persists.
            </p>
          </div>
        </div>

        {/* Error digest for support */}
        {error.digest && (
          <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4">
            <p className="text-xs text-muted-foreground break-all font-mono">
              Error ID: {error.digest}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Share this ID with support if the problem persists.
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-white font-bold text-sm shadow-glow-primary hover:opacity-90 transition-opacity active:scale-95"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl border border-border/50 text-foreground font-semibold text-sm hover:bg-muted/30 transition-colors active:scale-95 inline-flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Back to Home
          </Link>
        </div>

        {/* Support link - Pi friendly */}
        <p className="text-xs text-muted-foreground">
          Questions?{" "}
          <a href="https://pinetwork.medium.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Check Pi docs
          </a>
          {" "}or{" "}
          <a href="/contact" className="text-primary hover:underline">
            contact us
          </a>
        </p>
      </div>
    </div>
  )
}
