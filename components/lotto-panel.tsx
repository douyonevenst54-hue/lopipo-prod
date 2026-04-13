"use client"

import { useState } from "react"
import { X, Ticket, Trophy, Hash, ChevronDown, ChevronUp } from "lucide-react"
import { COLORS } from "@/lib/app-config"

// ─── Constants ────────────────────────────────────────────────────────────────

const TICKET_PRICE = 0.5
const PRIZE_CONTRIBUTION = 0.45
const BASE_PRIZE = 10 // starting prize pool in Pi

// ─── Types ────────────────────────────────────────────────────────────────────

interface LottoTicket {
  id: string
  name: string
  numbers: [string, string, string]
  purchasedAt: Date
}

interface LottoSeries {
  id: string
  label: string
  drawDate: string
  winningNumbers: [string, string, string] | null
  tickets: LottoTicket[]
  prizePool: number
  drawn: boolean
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_SERIES: LottoSeries[] = [
  {
    id: "s-001",
    label: "Series #001",
    drawDate: "2025-04-01",
    winningNumbers: ["3", "7", "9"],
    tickets: [
      { id: "t1", name: "Alice", numbers: ["3", "7", "9"], purchasedAt: new Date() },
      { id: "t2", name: "Bob", numbers: ["1", "2", "5"], purchasedAt: new Date() },
    ],
    prizePool: BASE_PRIZE + 2 * PRIZE_CONTRIBUTION,
    drawn: true,
  },
  {
    id: "s-002",
    label: "Series #002",
    drawDate: "2025-05-01",
    winningNumbers: null,
    tickets: [
      { id: "t3", name: "Carol", numbers: ["0", "4", "8"], purchasedAt: new Date() },
    ],
    prizePool: BASE_PRIZE + 1 * PRIZE_CONTRIBUTION,
    drawn: false,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

function formatPrize(prize: number) {
  return prize.toFixed(2)
}

// A single 3-digit number picker (0–9 per digit)
function NumberPicker({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const num = parseInt(value, 10)

  const increment = () => onChange(String((num + 1) % 10))
  const decrement = () => onChange(String((num - 1 + 10) % 10))

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <div className="flex flex-col items-center border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <button
          type="button"
          onClick={increment}
          className="w-10 h-8 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label={`Increase ${label}`}
        >
          <ChevronUp size={14} />
        </button>
        <div
          className="w-10 h-10 flex items-center justify-center text-xl font-bold text-foreground border-t border-b border-border select-none"
          style={{ color: COLORS.PRIMARY }}
        >
          {num}
        </div>
        <button
          type="button"
          onClick={decrement}
          className="w-10 h-8 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label={`Decrease ${label}`}
        >
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── Buy Ticket View ──────────────────────────────────────────────────────────

function BuyView({
  series,
  onBuy,
}: {
  series: LottoSeries[]
  onBuy: (seriesId: string, ticket: LottoTicket) => void
}) {
  const [selectedSeries, setSelectedSeries] = useState<string>(
    series.find((s) => !s.drawn)?.id ?? ""
  )
  const [name, setName] = useState("")
  const [digits, setDigits] = useState<[string, string, string]>(["0", "0", "0"])
  const [success, setSuccess] = useState(false)

  const openSeries = series.filter((s) => !s.drawn)
  const activeSeries = series.find((s) => s.id === selectedSeries)

  const handleDigit = (index: 0 | 1 | 2, val: string) => {
    const next: [string, string, string] = [...digits] as [string, string, string]
    next[index] = val
    setDigits(next)
  }

  const handleBuy = () => {
    if (!name.trim() || !selectedSeries) return
    const ticket: LottoTicket = {
      id: generateId(),
      name: name.trim(),
      numbers: digits,
      purchasedAt: new Date(),
    }
    onBuy(selectedSeries, ticket)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setName("")
      setDigits(["0", "0", "0"])
    }, 2500)
  }

  if (openSeries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
        <p className="text-xs text-muted-foreground">No active lotto series right now. Check back soon.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Series selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-foreground">Select Series</label>
        <select
          value={selectedSeries}
          onChange={(e) => setSelectedSeries(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {openSeries.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label} — Draw: {s.drawDate}
            </option>
          ))}
        </select>
      </div>

      {/* Prize pool display */}
      {activeSeries && (
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
              Current Prize Pool
            </span>
            <span className="text-lg font-bold text-foreground" style={{ color: COLORS.PRIMARY }}>
              {formatPrize(activeSeries.prizePool)} Pi
            </span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[10px] text-muted-foreground">Ticket price</span>
            <span className="text-sm font-bold text-foreground">{TICKET_PRICE} Pi</span>
            <span className="text-[10px] text-muted-foreground">
              {PRIZE_CONTRIBUTION} Pi goes to pool
            </span>
          </div>
        </div>
      )}

      {/* Name input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-foreground">Your Name</label>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Number picker */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Hash size={12} />
          Pick 3 Numbers (000 – 999)
        </label>
        <div className="flex items-center justify-center gap-4 py-3 px-4 rounded-xl bg-muted/40 border border-border">
          <NumberPicker label="1st" value={digits[0]} onChange={(v) => handleDigit(0, v)} />
          <span className="text-2xl font-bold text-muted-foreground pb-1">–</span>
          <NumberPicker label="2nd" value={digits[1]} onChange={(v) => handleDigit(1, v)} />
          <span className="text-2xl font-bold text-muted-foreground pb-1">–</span>
          <NumberPicker label="3rd" value={digits[2]} onChange={(v) => handleDigit(2, v)} />
        </div>
        <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
          Your combination:{" "}
          <strong className="text-foreground">{digits[0]}–{digits[1]}–{digits[2]}</strong>
        </p>
      </div>

      {/* Buy button / success */}
      {success ? (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-center flex flex-col gap-1">
          <p className="text-sm font-bold text-emerald-700">Ticket purchased!</p>
          <p className="text-xs text-emerald-600 leading-relaxed">
            Your numbers <strong>{digits[0]}–{digits[1]}–{digits[2]}</strong> have been entered.
            Good luck, <strong>{name}</strong>!
          </p>
        </div>
      ) : (
        <button
          onClick={handleBuy}
          disabled={!name.trim()}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          style={{ backgroundColor: COLORS.PRIMARY }}
        >
          <Ticket size={15} />
          Buy Ticket — {TICKET_PRICE} Pi
        </button>
      )}
    </div>
  )
}

// ─── Verify View ──────────────────────────────────────────────────────────────

function VerifyView({ series }: { series: LottoSeries[] }) {
  const [name, setName] = useState("")
  const [result, setResult] = useState<{
    found: boolean
    seriesLabel?: string
    numbers?: [string, string, string]
    prize?: number
  } | null>(null)

  const drawnSeries = series.filter((s) => s.drawn && s.winningNumbers)

  const handleVerify = () => {
    if (!name.trim()) return
    const nameLower = name.trim().toLowerCase()

    for (const s of drawnSeries) {
      const ticket = s.tickets.find(
        (t) =>
          t.name.toLowerCase() === nameLower &&
          t.numbers[0] === s.winningNumbers![0] &&
          t.numbers[1] === s.winningNumbers![1] &&
          t.numbers[2] === s.winningNumbers![2]
      )
      if (ticket) {
        setResult({
          found: true,
          seriesLabel: s.label,
          numbers: ticket.numbers,
          prize: s.prizePool,
        })
        return
      }
    }
    setResult({ found: false })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Enter your name to check if your numbers matched the winning combination in any completed series.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => { setName(e.target.value); setResult(null) }}
            className="flex-1 rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleVerify}
            disabled={!name.trim()}
            className="px-4 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: COLORS.PRIMARY }}
          >
            Check
          </button>
        </div>

        {result !== null && (
          result.found ? (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Trophy size={14} className="text-emerald-600 shrink-0" />
                <span className="text-sm font-bold text-emerald-700">You are a winner!</span>
              </div>
              <p className="text-xs text-emerald-600 leading-relaxed">
                Your numbers <strong>{result.numbers?.join("–")}</strong> matched in{" "}
                <strong>{result.seriesLabel}</strong>.
              </p>
              <p className="text-xs text-emerald-600">
                Prize pool: <strong>{formatPrize(result.prize ?? 0)} Pi</strong>. Contact the admin to claim.
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-muted px-4 py-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                No winning match found for <strong>"{name}"</strong> in completed series.
              </p>
            </div>
          )
        )}
      </div>

      {/* Past draws */}
      {drawnSeries.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Past Draws</p>
          {drawnSeries.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-border bg-card px-4 py-3 flex items-center justify-between gap-3"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-xs font-semibold text-foreground">{s.label}</span>
                <span className="text-[11px] text-muted-foreground">{s.drawDate}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] text-muted-foreground">Winning:</span>
                {s.winningNumbers!.map((n, i) => (
                  <span
                    key={i}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: COLORS.PRIMARY }}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

interface LottoPanelProps {
  open: boolean
  onClose: () => void
}

export function LottoPanel({ open, onClose }: LottoPanelProps) {
  const [tab, setTab] = useState<"buy" | "verify">("buy")
  const [series, setSeries] = useState<LottoSeries[]>(SEED_SERIES)

  const handleBuy = (seriesId: string, ticket: LottoTicket) => {
    setSeries((prev) =>
      prev.map((s) => {
        if (s.id !== seriesId) return s
        return {
          ...s,
          tickets: [...s.tickets, ticket],
          prizePool: parseFloat((s.prizePool + PRIZE_CONTRIBUTION).toFixed(2)),
        }
      })
    )
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl border border-border shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[82vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border shrink-0">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-bold text-foreground">Lotto</h2>
            <p className="text-xs text-muted-foreground">
              Pick 3 numbers (0–9 each) — ticket: {TICKET_PRICE} Pi
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close lotto panel"
          >
            <X size={15} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 px-5 py-3 border-b border-border shrink-0">
          {(["buy", "verify"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all
                ${tab === t
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
            >
              {t === "buy" ? "Buy Ticket" : "Verify Winner"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === "buy" ? (
            <BuyView series={series} onBuy={handleBuy} />
          ) : (
            <VerifyView series={series} />
          )}
        </div>
      </div>
    </div>
  )
}
