"use client"

import { useState, useEffect } from "react"
import { X, Ticket, Trophy, Plus, Trash2, Shuffle, ShieldCheck, Lock } from "lucide-react"
import { COLORS } from "@/lib/app-config"

// ─── Types ───────────────────────────────────────────────────────────────────

interface LotteryEntry {
  id: string
  name: string
  tickets: number
}

interface Lottery {
  id: string
  title: string
  description: string
  ticketPrice: number
  maxTickets: number
  entries: LotteryEntry[]
  winner: LotteryEntry | null
  drawn: boolean
  createdAt: Date
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

const ADMIN_PIN = "1234" // simple demo PIN gate

const SEED_LOTTERIES: Lottery[] = [
  {
    id: "lot-1",
    title: "Pi Network Season Pass",
    description: "Win an exclusive season pass for Pi Network early adopters.",
    ticketPrice: 1,
    maxTickets: 100,
    winner: null,
    drawn: false,
    createdAt: new Date(),
    entries: [
      { id: "e1", name: "Alice", tickets: 3 },
      { id: "e2", name: "Bob", tickets: 1 },
      { id: "e3", name: "Carol", tickets: 5 },
    ],
  },
  {
    id: "lot-2",
    title: "Game Night Grand Prize",
    description: "Random draw for the best gaming setup giveaway.",
    ticketPrice: 2,
    maxTickets: 50,
    winner: { id: "e1", name: "Alice", tickets: 3 },
    drawn: true,
    createdAt: new Date(),
    entries: [
      { id: "e1", name: "Alice", tickets: 3 },
      { id: "e2", name: "Dave", tickets: 2 },
    ],
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "pending" }) {
  const styles = {
    default: "bg-muted text-muted-foreground",
    success: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
  }
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles[variant]}`}>
      {children}
    </span>
  )
}

// ─── User View ────────────────────────────────────────────────────────────────

function UserView({ lotteries }: { lotteries: Lottery[] }) {
  const [verifyName, setVerifyName] = useState("")
  const [verifyResult, setVerifyResult] = useState<{ found: boolean; lottery?: Lottery } | null>(null)
  const [buyName, setBuyName] = useState("")
  const [buyQty, setBuyQty] = useState(1)
  const [buyTarget, setBuyTarget] = useState<string | null>(null)
  const [buySuccess, setBuySuccess] = useState(false)

  const openLotteries = lotteries.filter((l) => !l.drawn)
  const totalTickets = (l: Lottery) => l.entries.reduce((sum, e) => sum + e.tickets, 0)

  const handleBuy = (lotteryId: string) => {
    setBuyTarget(lotteryId)
    setBuySuccess(false)
    setBuyName("")
    setBuyQty(1)
  }

  const confirmBuy = () => {
    if (!buyName.trim() || buyQty < 1) return
    setBuySuccess(true)
    setTimeout(() => {
      setBuyTarget(null)
      setBuySuccess(false)
    }, 2000)
  }

  const handleVerify = () => {
    if (!verifyName.trim()) return
    const name = verifyName.trim().toLowerCase()
    const match = lotteries.find(
      (l) => l.drawn && l.winner && l.winner.name.toLowerCase() === name
    )
    setVerifyResult({ found: !!match, lottery: match })
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Buy Tickets Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Ticket size={15} className="text-primary" />
          <h3 className="text-sm font-bold text-foreground">Active Lotteries</h3>
          <Badge variant="pending">{openLotteries.length} open</Badge>
        </div>

        {openLotteries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
            <p className="text-xs text-muted-foreground">No active lotteries right now. Check back soon.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {openLotteries.map((lot) => (
              <div key={lot.id} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-semibold text-foreground text-pretty">{lot.title}</span>
                    <span className="text-xs text-muted-foreground leading-relaxed">{lot.description}</span>
                  </div>
                  <Badge variant="pending">Open</Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span><strong className="text-foreground">{lot.ticketPrice} Pi</strong> / ticket</span>
                  <span><strong className="text-foreground">{totalTickets(lot)}</strong> / {lot.maxTickets} sold</span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (totalTickets(lot) / lot.maxTickets) * 100)}%`,
                      backgroundColor: COLORS.PRIMARY,
                    }}
                  />
                </div>

                {buyTarget === lot.id ? (
                  <div className="flex flex-col gap-2 pt-1">
                    {buySuccess ? (
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 text-center">
                        Ticket purchased! Good luck!
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="Your name"
                          value={buyName}
                          onChange={(e) => setBuyName(e.target.value)}
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-muted-foreground shrink-0">Qty:</label>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={buyQty}
                            onChange={(e) => setBuyQty(Number(e.target.value))}
                            className="w-16 rounded-lg border border-input bg-background px-2 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                          <span className="text-xs text-muted-foreground">
                            = <strong className="text-foreground">{buyQty * lot.ticketPrice} Pi</strong>
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={confirmBuy}
                            disabled={!buyName.trim()}
                            className="flex-1 rounded-lg py-2 text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
                            style={{ backgroundColor: COLORS.PRIMARY }}
                          >
                            Confirm Purchase
                          </button>
                          <button
                            onClick={() => setBuyTarget(null)}
                            className="px-3 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuy(lot.id)}
                    className="w-full rounded-lg py-2 text-xs font-bold text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: COLORS.PRIMARY }}
                  >
                    Buy Ticket
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verify Winner Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={15} className="text-emerald-600" />
          <h3 className="text-sm font-bold text-foreground">Verify Winner</h3>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Enter your name to check if you won any completed lottery.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Your name"
              value={verifyName}
              onChange={(e) => { setVerifyName(e.target.value); setVerifyResult(null) }}
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleVerify}
              disabled={!verifyName.trim()}
              className="px-4 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: COLORS.PRIMARY }}
            >
              Check
            </button>
          </div>

          {verifyResult !== null && (
            verifyResult.found ? (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Trophy size={14} className="text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700">You are a winner!</span>
                </div>
                <p className="text-xs text-emerald-600 leading-relaxed">
                  You won <strong>{verifyResult.lottery?.title}</strong>. Contact the admin to claim your prize.
                </p>
              </div>
            ) : (
              <div className="rounded-lg bg-muted px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  No winning entry found for <strong>"{verifyName}"</strong> in completed lotteries.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Admin View ───────────────────────────────────────────────────────────────

function AdminView({
  lotteries,
  onUpdate,
}: {
  lotteries: Lottery[]
  onUpdate: (lotteries: Lottery[]) => void
}) {
  const [form, setForm] = useState({ title: "", description: "", ticketPrice: 1, maxTickets: 50 })
  const [creating, setCreating] = useState(false)

  const handleCreate = () => {
    if (!form.title.trim()) return
    const newLottery: Lottery = {
      id: generateId(),
      title: form.title.trim(),
      description: form.description.trim(),
      ticketPrice: form.ticketPrice,
      maxTickets: form.maxTickets,
      entries: [],
      winner: null,
      drawn: false,
      createdAt: new Date(),
    }
    onUpdate([newLottery, ...lotteries])
    setForm({ title: "", description: "", ticketPrice: 1, maxTickets: 50 })
    setCreating(false)
  }

  const handleDraw = (id: string) => {
    onUpdate(
      lotteries.map((l) => {
        if (l.id !== id || l.drawn || l.entries.length === 0) return l
        // weighted draw based on ticket count
        const pool: LotteryEntry[] = []
        l.entries.forEach((e) => { for (let i = 0; i < e.tickets; i++) pool.push(e) })
        const winner = pool[Math.floor(Math.random() * pool.length)]
        return { ...l, winner, drawn: true }
      })
    )
  }

  const handleDelete = (id: string) => {
    onUpdate(lotteries.filter((l) => l.id !== id))
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Create New */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">All Lotteries</h3>
        <button
          onClick={() => setCreating((p) => !p)}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all hover:opacity-90"
          style={{ backgroundColor: COLORS.PRIMARY }}
        >
          <Plus size={12} />
          New Lottery
        </button>
      </div>

      {creating && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-foreground">Create Lottery</p>
          <input
            type="text"
            placeholder="Title"
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
              <label className="text-[10px] text-muted-foreground font-medium">Ticket Price (Pi)</label>
              <input
                type="number"
                min={1}
                value={form.ticketPrice}
                onChange={(e) => setForm({ ...form, ticketPrice: Number(e.target.value) })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] text-muted-foreground font-medium">Max Tickets</label>
              <input
                type="number"
                min={10}
                value={form.maxTickets}
                onChange={(e) => setForm({ ...form, maxTickets: Number(e.target.value) })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
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

      {/* Lottery List */}
      <div className="flex flex-col gap-3">
        {lotteries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
            <p className="text-xs text-muted-foreground">No lotteries yet. Create one above.</p>
          </div>
        ) : (
          lotteries.map((lot) => {
            const totalTickets = lot.entries.reduce((s, e) => s + e.tickets, 0)
            return (
              <div key={lot.id} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-semibold text-foreground text-pretty">{lot.title}</span>
                    {lot.description && (
                      <span className="text-xs text-muted-foreground">{lot.description}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant={lot.drawn ? "success" : "pending"}>
                      {lot.drawn ? "Drawn" : "Open"}
                    </Badge>
                    <button
                      onClick={() => handleDelete(lot.id)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Delete lottery"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span><strong className="text-foreground">{lot.ticketPrice} Pi</strong> / ticket</span>
                  <span><strong className="text-foreground">{totalTickets}</strong> / {lot.maxTickets} sold</span>
                  <span><strong className="text-foreground">{lot.entries.length}</strong> participants</span>
                </div>

                {lot.drawn && lot.winner ? (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 flex items-center gap-2">
                    <Trophy size={13} className="text-emerald-600 shrink-0" />
                    <p className="text-xs text-emerald-700">
                      Winner: <strong>{lot.winner.name}</strong> ({lot.winner.tickets} ticket{lot.winner.tickets !== 1 ? "s" : ""})
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDraw(lot.id)}
                    disabled={lot.entries.length === 0}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold border border-primary text-primary hover:bg-primary/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Shuffle size={12} />
                    Draw Winner
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

// ─── Admin PIN Gate ───────────────────────────────────────────────────────────

function AdminGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("")
  const [error, setError] = useState(false)

  const handleSubmit = () => {
    if (pin === ADMIN_PIN) {
      onUnlock()
    } else {
      setError(true)
      setTimeout(() => setError(false), 1500)
      setPin("")
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 py-8 px-2">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Lock size={20} className="text-muted-foreground" />
        </div>
        <p className="text-sm font-bold text-foreground">Admin Access Required</p>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px]">
          Enter your admin PIN to manage lotteries and draw winners.
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-[200px]">
        <input
          type="password"
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className={`w-full rounded-xl border px-4 py-2.5 text-sm text-center text-foreground tracking-widest focus:outline-none focus:ring-2 focus:ring-ring transition-colors
            ${error ? "border-destructive bg-destructive/5" : "border-input bg-background"}`}
          maxLength={8}
        />
        {error && (
          <p className="text-xs text-destructive text-center font-medium">Incorrect PIN</p>
        )}
        <button
          onClick={handleSubmit}
          disabled={!pin}
          className="w-full rounded-xl py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: COLORS.PRIMARY }}
        >
          Unlock
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground">Demo PIN: 1234</p>
    </div>
  )
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

interface LotteryPanelProps {
  open: boolean
  onClose: () => void
}

export function LotteryPanel({ open, onClose }: LotteryPanelProps) {
  const [tab, setTab] = useState<"user" | "admin">("user")
  const [adminUnlocked, setAdminUnlocked] = useState(false)
  const [lotteries, setLotteries] = useState<Lottery[]>(SEED_LOTTERIES)

  // Reset admin lock when panel closes
  useEffect(() => {
    if (!open) {
      setAdminUnlocked(false)
      setTab("user")
    }
  }, [open])

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
      <div className="relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl border border-border shadow-2xl flex flex-col max-h-[88vh] sm:max-h-[80vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border shrink-0">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-bold text-foreground">Lottery</h2>
            <p className="text-xs text-muted-foreground">Buy tickets or verify your winning</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close panel"
          >
            <X size={15} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 px-5 py-3 border-b border-border shrink-0">
          {(["user", "admin"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all
                ${tab === t
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
            >
              {t === "user" ? "Player" : "Admin"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === "user" ? (
            <UserView lotteries={lotteries} />
          ) : adminUnlocked ? (
            <AdminView lotteries={lotteries} onUpdate={setLotteries} />
          ) : (
            <AdminGate onUnlock={() => setAdminUnlocked(true)} />
          )}
        </div>
      </div>
    </div>
  )
}
