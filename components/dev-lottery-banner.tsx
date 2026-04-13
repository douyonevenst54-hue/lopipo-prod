"use client"

import { useState, useEffect, useCallback } from "react"
import { Ticket, Trophy, ChevronDown, ChevronUp, Plus, Shuffle, Trash2, Lock, ShieldCheck, X, Clock, Zap } from "lucide-react"
import { COLORS } from "@/lib/app-config"

// ─── Types ────────────────────────────────────────────────────────────────────

interface LotteryEntry {
  id: string
  name: string
  tickets: number
  paid: number
}

interface DevSeries {
  id: string
  title: string
  description: string
  prizePool: number
  ticketPrice: number
  prizeShare: number
  maxTickets: number
  entries: LotteryEntry[]
  winner: LotteryEntry | null
  drawn: boolean
  createdAt: string
  drawAt: number | null   // unix ms timestamp; null = manual only
  drawnAt: string | null  // human-readable time of actual draw
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEV_PIN = "181962"
const TICKET_PRICE = 0.5
const PRIZE_SHARE = 0.45

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

// Draw time 48 h from now for the seed series
const GENESIS_DRAW_AT = Date.now() + 48 * 60 * 60 * 1000

const INITIAL_SERIES: DevSeries[] = [
  {
    id: "dev-1",
    title: "LoPiPo Genesis Draw",
    description: "The first official LoPiPo lottery series. Every 0.5 Pi ticket adds 0.45 Pi to the prize pool.",
    prizePool: 12.6,
    ticketPrice: TICKET_PRICE,
    prizeShare: PRIZE_SHARE,
    maxTickets: 200,
    entries: [
      { id: "e1", name: "Alice", tickets: 3, paid: 1.5 },
      { id: "e2", name: "Bob", tickets: 1, paid: 0.5 },
      { id: "e3", name: "Carol", tickets: 5, paid: 2.5 },
    ],
    winner: null,
    drawn: false,
    createdAt: new Date().toLocaleDateString(),
    drawAt: GENESIS_DRAW_AT,
    drawnAt: null,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function totalTicketsSold(series: DevSeries) {
  return series.entries.reduce((s, e) => s + e.tickets, 0)
}

function computePrizePool(series: DevSeries) {
  return series.prizePool + totalTicketsSold(series) * PRIZE_SHARE
}

function pickWinner(series: DevSeries): LotteryEntry | null {
  if (series.entries.length === 0) return null
  const pool: LotteryEntry[] = []
  series.entries.forEach((e) => {
    for (let i = 0; i < e.tickets; i++) pool.push(e)
  })
  return pool[Math.floor(Math.random() * pool.length)]
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Drawing now..."
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

// ─── Dev PIN Gate ──────────────────────────────────────────────────────────────

function DevPinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("")
  const [error, setError] = useState(false)

  const handleSubmit = () => {
    if (pin === DEV_PIN) {
      onUnlock()
    } else {
      setError(true)
      setTimeout(() => setError(false), 1500)
      setPin("")
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 py-6 px-4">
      <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center">
        <Lock size={18} className="text-muted-foreground" />
      </div>
      <div className="text-center flex flex-col gap-1">
        <p className="text-sm font-bold text-foreground">Developer Access Required</p>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
          Only developers can create or manage lottery series.
        </p>
      </div>
      <div className="flex gap-2 w-full max-w-[240px]">
        <input
          type="password"
          placeholder="Developer PIN"
          value={pin}
          onChange={(e) => { setPin(e.target.value); setError(false) }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-colors
            ${error ? "border-destructive focus:ring-destructive/30 bg-destructive/5" : "border-input bg-background focus:ring-ring"}`}
        />
        <button
          onClick={handleSubmit}
          disabled={!pin.trim()}
          className="px-4 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: COLORS.PRIMARY }}
        >
          Enter
        </button>
      </div>
      {error && (
        <p className="text-xs text-destructive font-medium">Incorrect PIN. Try again.</p>
      )}
    </div>
  )
}

// ─── Countdown Badge ─────────────────────────────────────────────────────────

function CountdownBadge({ drawAt }: { drawAt: number }) {
  const [remaining, setRemaining] = useState(() => drawAt - Date.now())

  useEffect(() => {
    if (remaining <= 0) return
    const id = setInterval(() => setRemaining(drawAt - Date.now()), 1000)
    return () => clearInterval(id)
  }, [drawAt, remaining])

  const urgent = remaining <= 5 * 60 * 1000 && remaining > 0

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors
        ${urgent ? "bg-red-100 text-red-700" : "bg-sky-100 text-sky-700"}`}
    >
      <Clock size={9} />
      {formatCountdown(remaining)}
    </span>
  )
}

// ─── Admin / Developer Panel ──────────────────────────────────────────────────

function DevManagePanel({
  series,
  onUpdate,
  onClose,
}: {
  series: DevSeries[]
  onUpdate: (s: DevSeries[]) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    basePrize: 0,
    maxTickets: 100,
    drawDate: "",
    drawTime: "",
  })
  const [creating, setCreating] = useState(false)

  const handleCreate = () => {
    if (!form.title.trim()) return
    let drawAt: number | null = null
    if (form.drawDate && form.drawTime) {
      drawAt = new Date(`${form.drawDate}T${form.drawTime}`).getTime()
    }
    const newSeries: DevSeries = {
      id: generateId(),
      title: form.title.trim(),
      description: form.description.trim(),
      prizePool: form.basePrize,
      ticketPrice: TICKET_PRICE,
      prizeShare: PRIZE_SHARE,
      maxTickets: form.maxTickets,
      entries: [],
      winner: null,
      drawn: false,
      createdAt: new Date().toLocaleDateString(),
      drawAt,
      drawnAt: null,
    }
    onUpdate([newSeries, ...series])
    setForm({ title: "", description: "", basePrize: 0, maxTickets: 100, drawDate: "", drawTime: "" })
    setCreating(false)
  }

  const handleDraw = (id: string) => {
    onUpdate(
      series.map((s) => {
        if (s.id !== id || s.drawn) return s
        const winner = pickWinner(s)
        return {
          ...s,
          winner,
          drawn: true,
          drawnAt: new Date().toLocaleString(),
        }
      })
    )
  }

  const handleDelete = (id: string) => {
    onUpdate(series.filter((s) => s.id !== id))
  }

  // Min datetime string for the picker (now + 5 min)
  const minDatetime = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-primary" />
          <h3 className="text-sm font-bold text-foreground">Developer Panel</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreating((p) => !p)}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all hover:opacity-90"
            style={{ backgroundColor: COLORS.PRIMARY }}
          >
            <Plus size={11} />
            New Series
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close developer panel"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {creating && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex flex-col gap-3">
          <p className="text-xs font-bold text-foreground">Create New Series</p>
          <input
            type="text"
            placeholder="Series title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] font-medium text-muted-foreground">Base Prize Pool (Pi)</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={form.basePrize}
                onChange={(e) => setForm({ ...form, basePrize: Number(e.target.value) })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] font-medium text-muted-foreground">Max Tickets</label>
              <input
                type="number"
                min={10}
                value={form.maxTickets}
                onChange={(e) => setForm({ ...form, maxTickets: Number(e.target.value) })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Draw time picker */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-muted-foreground">
              Scheduled Draw Time <span className="text-muted-foreground/60">(optional — leave blank for manual draw)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                min={minDatetime.slice(0, 10)}
                value={form.drawDate}
                onChange={(e) => setForm({ ...form, drawDate: e.target.value })}
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="time"
                value={form.drawTime}
                onChange={(e) => setForm({ ...form, drawTime: e.target.value })}
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="rounded-lg bg-muted/60 px-3 py-2 text-[10px] text-muted-foreground leading-relaxed">
            Ticket price is fixed at <strong className="text-foreground">0.5 Pi</strong>. Each ticket adds{" "}
            <strong className="text-foreground">0.45 Pi</strong> to the prize pool. If a draw time is set, the winner is drawn automatically.
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!form.title.trim()}
              className="flex-1 rounded-lg py-2 text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: COLORS.PRIMARY }}
            >
              Create
            </button>
            <button
              onClick={() => setCreating(false)}
              className="px-3 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {series.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-center">
            <p className="text-xs text-muted-foreground">No series created yet.</p>
          </div>
        ) : (
          series.map((s) => {
            const sold = totalTicketsSold(s)
            const pool = computePrizePool(s)
            return (
              <div key={s.id} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-semibold text-foreground text-pretty">{s.title}</span>
                    {s.description && (
                      <span className="text-xs text-muted-foreground leading-relaxed">{s.description}</span>
                    )}
                    {s.drawAt && !s.drawn && (
                      <span className="text-[10px] text-muted-foreground">
                        Draw: {new Date(s.drawAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.drawn ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {s.drawn ? "Drawn" : "Open"}
                    </span>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Delete series"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <span><strong className="text-foreground">{sold}</strong> / {s.maxTickets} sold</span>
                  <span><strong className="text-foreground">{s.entries.length}</strong> players</span>
                  <span>Pool: <strong className="text-foreground">{pool.toFixed(2)} Pi</strong></span>
                </div>
                {s.drawn && s.winner ? (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 flex items-center gap-2">
                    <Trophy size={12} className="text-emerald-600 shrink-0" />
                    <p className="text-xs text-emerald-700">
                      Winner: <strong>{s.winner.name}</strong>
                      {s.drawnAt && <span className="text-emerald-600 font-normal"> · drawn {s.drawnAt}</span>}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDraw(s.id)}
                    disabled={s.entries.length === 0}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold border border-primary text-primary hover:bg-primary/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Shuffle size={12} />
                    Draw Winner Now
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ─── Buy Ticket Form ───────────────────────────────────────────────────────────

function BuyTicketForm({
  series,
  onConfirm,
}: {
  series: DevSeries
  onConfirm: (name: string, qty: number) => void
}) {
  const [name, setName] = useState("")
  const [qty, setQty] = useState(1)
  const [success, setSuccess] = useState(false)
  const [open, setOpen] = useState(false)

  const sold = totalTicketsSold(series)
  const remaining = series.maxTickets - sold
  const maxBuy = Math.min(10, remaining)

  const handleConfirm = () => {
    if (!name.trim() || qty < 1) return
    onConfirm(name.trim(), qty)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setOpen(false)
      setName("")
      setQty(1)
    }, 2500)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        disabled={series.drawn || remaining === 0}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ backgroundColor: COLORS.PRIMARY }}
      >
        <Ticket size={14} />
        Buy Ticket — 0.5 Pi
      </button>
    )
  }

  if (success) {
    return (
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-center flex flex-col gap-1">
        <p className="text-sm font-bold text-emerald-700">Ticket purchased!</p>
        <p className="text-xs text-emerald-600">
          {qty} ticket{qty > 1 ? "s" : ""} for <strong>{name}</strong> —{" "}
          <strong>{(qty * TICKET_PRICE).toFixed(2)} Pi</strong> paid. Good luck!
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 pt-1">
      <div className="h-px bg-border" />
      <p className="text-xs font-semibold text-foreground">Your details</p>
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-[10px] font-medium text-muted-foreground">Tickets (max {maxBuy})</label>
          <input
            type="number"
            min={1}
            max={maxBuy}
            value={qty}
            onChange={(e) => setQty(Math.min(maxBuy, Math.max(1, Number(e.target.value))))}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <label className="text-[10px] font-medium text-muted-foreground">Total cost</label>
          <div className="px-3 py-2 rounded-lg bg-muted text-sm font-bold text-foreground">
            {(qty * TICKET_PRICE).toFixed(2)} Pi
          </div>
        </div>
      </div>
      <div className="rounded-lg bg-muted/60 px-3 py-2 text-[10px] text-muted-foreground leading-relaxed">
        <strong className="text-foreground">{(qty * PRIZE_SHARE).toFixed(2)} Pi</strong> of your payment goes directly into the prize pool.
        Current pool: <strong className="text-foreground">{computePrizePool(series).toFixed(2)} Pi</strong>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleConfirm}
          disabled={!name.trim()}
          className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
          style={{ backgroundColor: COLORS.PRIMARY }}
        >
          Confirm Purchase
        </button>
        <button
          onClick={() => { setOpen(false); setName(""); setQty(1) }}
          className="px-4 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Main Banner Component ─────────────────────────────────────────────────────

export function DevLotteryBanner() {
  const [series, setSeries] = useState<DevSeries[]>(INITIAL_SERIES)
  const [expanded, setExpanded] = useState(true)
  const [devMode, setDevMode] = useState(false)
  const [pinGate, setPinGate] = useState(false)

  // Auto-draw: fire when drawAt passes for any open series
  const autoDraw = useCallback(() => {
    setSeries((prev) => {
      const now = Date.now()
      let changed = false
      const next = prev.map((s) => {
        if (s.drawn || !s.drawAt || s.drawAt > now) return s
        const winner = pickWinner(s)
        changed = true
        return {
          ...s,
          winner,
          drawn: true,
          drawnAt: new Date().toLocaleString(),
        }
      })
      return changed ? next : prev
    })
  }, [])

  useEffect(() => {
    const id = setInterval(autoDraw, 1000)
    return () => clearInterval(id)
  }, [autoDraw])

  const openSeries = series.filter((s) => !s.drawn)
  const drawnSeries = series.filter((s) => s.drawn)

  const handleBuyConfirm = (seriesId: string, name: string, qty: number) => {
    setSeries((prev) =>
      prev.map((s) => {
        if (s.id !== seriesId) return s
        const existing = s.entries.find((e) => e.name.toLowerCase() === name.toLowerCase())
        if (existing) {
          return {
            ...s,
            entries: s.entries.map((e) =>
              e.id === existing.id
                ? { ...e, tickets: e.tickets + qty, paid: e.paid + qty * TICKET_PRICE }
                : e
            ),
          }
        }
        return {
          ...s,
          entries: [
            ...s.entries,
            { id: generateId(), name, tickets: qty, paid: qty * TICKET_PRICE },
          ],
        }
      })
    )
  }

  const handleDevUnlock = () => {
    setDevMode(true)
    setPinGate(false)
  }

  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${COLORS.PRIMARY}20` }}
          >
            <Ticket size={16} style={{ color: COLORS.PRIMARY }} />
          </div>
          <div className="text-left flex flex-col gap-0.5">
            <span className="text-sm font-bold text-foreground">Official Lottery</span>
            <span className="text-xs text-muted-foreground leading-relaxed">
              {openSeries.length} active series · buy tickets to grow the prize pool
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${COLORS.PRIMARY}20`, color: COLORS.PRIMARY }}
          >
            0.5 Pi / ticket
          </span>
          {expanded ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
        </div>
      </button>

      {/* Body */}
      {expanded && (
        <div className="px-5 pb-5 flex flex-col gap-5 border-t border-border pt-4">

          {/* Developer toggle */}
          {!devMode && (
            <div className="flex justify-end">
              <button
                onClick={() => setPinGate((p) => !p)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Lock size={11} />
                Developer
              </button>
            </div>
          )}

          {/* PIN Gate */}
          {pinGate && !devMode && (
            <div className="rounded-xl border border-border bg-background">
              <DevPinGate onUnlock={handleDevUnlock} />
            </div>
          )}

          {/* Developer Panel */}
          {devMode && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <DevManagePanel
                series={series}
                onUpdate={setSeries}
                onClose={() => setDevMode(false)}
              />
            </div>
          )}

          {/* User-facing series list */}
          {!devMode && (
            <>
              {openSeries.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
                  <p className="text-xs text-muted-foreground">No active lottery series right now. Check back soon.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {openSeries.map((s) => {
                    const sold = totalTicketsSold(s)
                    const pool = computePrizePool(s)
                    const pct = Math.min(100, (sold / s.maxTickets) * 100)
                    return (
                      <div key={s.id} className="rounded-xl border border-border bg-background p-4 flex flex-col gap-3">
                        {/* Title row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-sm font-semibold text-foreground text-pretty">{s.title}</span>
                            {s.description && (
                              <span className="text-xs text-muted-foreground leading-relaxed">{s.description}</span>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                              Open
                            </span>
                            {/* Countdown badge */}
                            {s.drawAt && (
                              <CountdownBadge drawAt={s.drawAt} />
                            )}
                          </div>
                        </div>

                        {/* Draw time label */}
                        {s.drawAt && (
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Zap size={9} className="text-amber-500" />
                            Auto-draw scheduled for{" "}
                            <strong className="text-foreground">{new Date(s.drawAt).toLocaleString()}</strong>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex flex-col gap-0.5 rounded-lg bg-muted/60 px-2.5 py-2">
                            <span className="text-[10px] text-muted-foreground">Ticket</span>
                            <span className="text-xs font-bold text-foreground">0.5 Pi</span>
                          </div>
                          <div className="flex flex-col gap-0.5 rounded-lg bg-muted/60 px-2.5 py-2">
                            <span className="text-[10px] text-muted-foreground">Prize Pool</span>
                            <span className="text-xs font-bold text-foreground">{pool.toFixed(2)} Pi</span>
                          </div>
                          <div className="flex flex-col gap-0.5 rounded-lg bg-muted/60 px-2.5 py-2">
                            <span className="text-[10px] text-muted-foreground">Tickets Left</span>
                            <span className="text-xs font-bold text-foreground">{s.maxTickets - sold}</span>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>{sold} sold</span>
                            <span>{s.maxTickets} max</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: COLORS.PRIMARY }}
                            />
                          </div>
                        </div>

                        {/* Buy ticket */}
                        <BuyTicketForm series={s} onConfirm={(name, qty) => handleBuyConfirm(s.id, name, qty)} />
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Past draws */}
              {drawnSeries.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Past Draws</p>
                  {drawnSeries.map((s) => {
                    const pool = computePrizePool(s)
                    return (
                      <div key={s.id} className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <Trophy size={14} className="text-emerald-600" />
                          </div>
                          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                            <span className="text-xs font-semibold text-foreground text-pretty">{s.title}</span>
                            {s.drawnAt && (
                              <span className="text-[10px] text-muted-foreground">Drawn on {s.drawnAt}</span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                            Drawn
                          </span>
                        </div>
                        {/* Winner highlight */}
                        <div className="rounded-lg bg-white border border-emerald-200 px-3 py-2.5 flex items-center justify-between gap-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Winner</span>
                            <span className="text-sm font-bold text-foreground">{s.winner?.name ?? "—"}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {s.winner?.tickets ?? 0} ticket{(s.winner?.tickets ?? 0) > 1 ? "s" : ""} held
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Prize</span>
                            <span className="text-sm font-bold text-emerald-700">{pool.toFixed(2)} Pi</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  )
}
