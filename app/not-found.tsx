"use client"

import Link from "next/link"
import { Home, AlertTriangle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30">
            <AlertTriangle size={40} className="text-amber-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-5xl font-syne font-bold text-foreground">404</h1>
          <p className="text-lg font-syne font-semibold text-muted-foreground">
            Page Not Found
          </p>
          <p className="text-sm text-muted-foreground">
            The page you're looking for has wandered off into the cosmic void. Let's get you back on track.
          </p>
        </div>

        {/* Error details */}
        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4">
          <p className="text-xs text-muted-foreground">
            If you believe this is a mistake, please contact support or try again in a moment.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-gold text-white font-bold text-sm shadow-glow-gold hover:opacity-90 transition-opacity active:scale-95"
          >
            <Home size={18} />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl border border-border/50 text-foreground font-semibold text-sm hover:bg-muted/30 transition-colors active:scale-95"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
