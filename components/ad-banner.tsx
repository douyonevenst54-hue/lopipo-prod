"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface Ad {
  id: string
  title: string
  description: string
  image_url: string
  cta_text: string
  cta_link: string
}

interface AdBannerProps {
  placement?: string
}

export function AdBanner({ placement = "home" }: AdBannerProps) {
  const [ad, setAd] = useState<Ad | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await fetch(`/api/ads?placement=${placement}`)
        const data = await res.json()
        setAd(data.ad)
      } catch (error) {
        console.error("[v0] Fetch ad error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAd()
  }, [placement])

  if (!ad || dismissed || loading) return null

  return (
    <section className="rounded-2xl border border-border bg-gradient-to-r from-primary/10 to-accent/10 overflow-hidden flex flex-col md:flex-row md:items-center md:gap-4">
      {/* Ad Image */}
      {ad.image_url && (
        <div className="w-full md:w-32 h-32 shrink-0 bg-muted overflow-hidden">
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Ad Content */}
      <div className="flex-1 p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground">{ad.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{ad.description}</p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
            aria-label="Dismiss ad"
          >
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>

        {/* CTA Button */}
        <a
          href={ad.cta_link}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-primary shadow-glow-primary hover:opacity-90 transition-opacity"
        >
          {ad.cta_text}
        </a>
      </div>

      {/* Sponsored Badge */}
      <div className="absolute top-2 right-2 text-[10px] font-bold text-muted-foreground bg-card px-2 py-1 rounded">
        Sponsored
      </div>
    </section>
  )
}
