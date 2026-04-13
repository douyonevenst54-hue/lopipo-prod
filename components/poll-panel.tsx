"use client"

import { useState, useEffect } from "react"
import { X, Vote, Link2, Check, Users, BarChart2, Clock, Plus, Trash2 } from "lucide-react"
import { COLORS } from "@/lib/app-config"

interface ResultItem {
  id: number
  label: string
  emoji: string
  description: string
}

interface PollOption {
  id: number
  label: string
  emoji: string
  votes: number
}

interface Poll {
  id: string
  title: string
  options: PollOption[]
  expiresAt: Date | null
  createdAt: Date
  totalVotes: number
  votedOptionId: number | null
}

interface PollPanelProps {
  open: boolean
  onClose: () => void
  topic: string
  results: ResultItem[]
}

function generatePollId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function formatTimeLeft(expiresAt: Date | null): string {
  if (!expiresAt) return "No expiry"
  const ms = expiresAt.getTime() - Date.now()
  if (ms <= 0) return "Expired"
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  if (h > 0) return `${h}h ${m}m left`
  return `${m}m left`
}

export function PollPanel({ open, onClose, topic, results }: PollPanelProps) {
  const [view, setView] = useState<"setup" | "live">("setup")
  const [pollTitle, setPollTitle] = useState("")
  const [duration, setDuration] = useState<number | null>(60) // minutes, null = no expiry
  const [poll, setPoll] = useState<Poll | null>(null)
  const [copied, setCopied] = useState(false)
  const [voterName, setVoterName] = useState("")
  const [nameError, setNameError] = useState("")
  const [timeLeft, setTimeLeft] = useState("")

  // Sync title with topic prop
  useEffect(() => {
    if (open) {
      setPollTitle(topic ? `Best ${topic}?` : "")
      setView("setup")
      setPoll(null)
      setCopied(false)
      setVoterName("")
      setNameError("")
    }
  }, [open, topic])

  // Countdown timer
  useEffect(() => {
    if (!poll) return
    const interval = setInterval(() => {
      setTimeLeft(formatTimeLeft(poll.expiresAt))
    }, 10000)
    setTimeLeft(formatTimeLeft(poll.expiresAt))
    return () => clearInterval(interval)
  }, [poll])

  const handleCreatePoll = () => {
    if (!pollTitle.trim()) return
    const newPoll: Poll = {
      id: generatePollId(),
      title: pollTitle.trim(),
      options: results.map((r) => ({ id: r.id, label: r.label, emoji: r.emoji, votes: 0 })),
      expiresAt: duration ? new Date(Date.now() + duration * 60 * 1000) : null,
      createdAt: new Date(),
      totalVotes: 0,
      votedOptionId: null,
    }
    setPoll(newPoll)
    setView("live")
  }

  const handleVote = (optionId: number) => {
    if (!poll || poll.votedOptionId !== null) return
    if (!voterName.trim()) {
      setNameError("Please enter your name to vote.")
      return
    }
    setNameError("")
    const expired = poll.expiresAt && poll.expiresAt.getTime() < Date.now()
    if (expired) return
    setPoll((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        options: prev.options.map((o) =>
          o.id === optionId ? { ...o, votes: o.votes + 1 } : o
        ),
        totalVotes: prev.totalVotes + 1,
        votedOptionId: optionId,
      }
    })
  }

  const handleCopyLink = () => {
    const link = `${window.location.origin}/poll/${poll?.id}`
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const maxVotes = poll ? Math.max(...poll.options.map((o) => o.votes), 1) : 1

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-lg bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${COLORS.PRIMARY}18` }}
            >
              <Vote size={15} style={{ color: COLORS.PRIMARY }} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Create Poll</p>
              <p className="text-[11px] text-muted-foreground">
                {view === "setup" ? "Set up your team poll" : "Live results"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Bar (only when poll is live) */}
        {poll && (
          <div className="flex border-b border-border shrink-0">
            {(["setup", "live"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setView(tab)}
                className={`flex-1 py-2.5 text-xs font-semibold transition-colors
                  ${view === tab
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {tab === "setup" ? "Poll Setup" : "Live Results"}
              </button>
            ))}
          </div>
        )}

        <div className="overflow-y-auto flex-1">
          {/* ── SETUP VIEW ── */}
          {view === "setup" && (
            <div className="px-5 py-5 flex flex-col gap-5">

              {/* Poll Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Poll Question
                </label>
                <input
                  type="text"
                  value={pollTitle}
                  onChange={(e) => setPollTitle(e.target.value)}
                  placeholder="e.g. Best pizza topping?"
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
              </div>

              {/* Options Preview */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                    Options ({results.length})
                  </label>
                  <span className="text-[11px] text-muted-foreground">Auto-filled from game</span>
                </div>
                <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-1">
                  {results.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-muted border border-border/50"
                    >
                      <span className="text-base leading-none">{r.emoji}</span>
                      <span className="text-sm font-medium text-foreground">{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Poll Duration
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "30 min", value: 30 },
                    { label: "1 hr", value: 60 },
                    { label: "6 hrs", value: 360 },
                    { label: "24 hrs", value: 1440 },
                    { label: "No expiry", value: null },
                  ].map((opt) => (
                    <button
                      key={String(opt.value)}
                      onClick={() => setDuration(opt.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                        ${duration === opt.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-border hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Launch Button */}
              <button
                onClick={handleCreatePoll}
                disabled={!pollTitle.trim() || results.length === 0}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: COLORS.PRIMARY }}
              >
                <Vote size={15} />
                Launch Poll
              </button>
            </div>
          )}

          {/* ── LIVE VIEW ── */}
          {view === "live" && poll && (
            <div className="px-5 py-5 flex flex-col gap-5">

              {/* Poll Meta */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-foreground text-pretty leading-snug">
                    {poll.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Users size={11} />
                      {poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock size={11} />
                      {timeLeft}
                    </span>
                  </div>
                </div>
                {/* Share Link */}
                <button
                  onClick={handleCopyLink}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0
                    ${copied
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-muted border-border text-muted-foreground hover:text-foreground hover:bg-muted/80"
                    }`}
                >
                  {copied ? <Check size={12} /> : <Link2 size={12} />}
                  {copied ? "Copied!" : "Share link"}
                </button>
              </div>

              {/* Voter Name (before voting) */}
              {poll.votedOptionId === null && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={voterName}
                    onChange={(e) => { setVoterName(e.target.value); setNameError("") }}
                    placeholder="Enter your name to vote"
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  />
                  {nameError && (
                    <p className="text-xs text-destructive">{nameError}</p>
                  )}
                </div>
              )}

              {/* Voted confirmation */}
              {poll.votedOptionId !== null && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <p className="text-xs font-semibold text-emerald-700">
                    You voted for{" "}
                    <span className="font-bold">
                      {poll.options.find((o) => o.id === poll.votedOptionId)?.label}
                    </span>
                  </p>
                </div>
              )}

              {/* Options with vote bars */}
              <div className="flex flex-col gap-2.5">
                {poll.options.map((option) => {
                  const pct = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0
                  const isWinner = option.votes === maxVotes && poll.totalVotes > 0
                  const isVoted = poll.votedOptionId === option.id
                  const canVote = poll.votedOptionId === null && !(poll.expiresAt && poll.expiresAt.getTime() < Date.now())

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleVote(option.id)}
                      disabled={!canVote}
                      className={`w-full text-left rounded-xl border p-3 transition-all relative overflow-hidden
                        ${isVoted
                          ? "border-primary bg-primary/5"
                          : canVote
                            ? "border-border bg-card hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                            : "border-border bg-card cursor-default"
                        }`}
                    >
                      {/* Bar fill */}
                      {poll.totalVotes > 0 && (
                        <div
                          className="absolute inset-y-0 left-0 rounded-xl opacity-10 transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: COLORS.PRIMARY }}
                        />
                      )}

                      <div className="relative flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                          <span className="text-lg leading-none">{option.emoji}</span>
                          <span className="text-sm font-semibold text-foreground">{option.label}</span>
                          {isWinner && poll.totalVotes > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                              Leading
                            </span>
                          )}
                        </span>
                        {poll.totalVotes > 0 && (
                          <span className="text-xs font-bold text-muted-foreground shrink-0">
                            {pct}%
                          </span>
                        )}
                        {canVote && (
                          <span
                            className="text-[10px] font-semibold shrink-0"
                            style={{ color: COLORS.PRIMARY }}
                          >
                            Vote
                          </span>
                        )}
                      </div>

                      {poll.totalVotes > 0 && (
                        <p className="relative text-[11px] text-muted-foreground mt-1 pl-7">
                          {option.votes} vote{option.votes !== 1 ? "s" : ""}
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Poll ID */}
              <p className="text-center text-[10px] text-muted-foreground">
                Poll ID: <span className="font-mono font-semibold">{poll.id}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
