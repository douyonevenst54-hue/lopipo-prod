"use client"

import { useState, useEffect, useRef } from "react"
import {
  X, Vote, Link2, Check, Users, Clock, BarChart3,
  Twitter, Flame, TrendingUp, Share2, Trophy
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

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

export interface LivePoll {
  id: string
  title: string
  topic: string
  hashtags: string[]
  options: PollOption[]
  expiresAt: Date | null
  createdAt: Date
  totalVotes: number
  votedOptionId: number | null
}

interface LivePollPanelProps {
  open: boolean
  onClose: () => void
  topic: string
  results: ResultItem[]
  onPollCreated?: (poll: LivePoll) => void
}

// ─── Sport detection ──────────────────────────────────────────────────────────

const SPORT_TAG_MAP: { keywords: string[]; hashtags: string[]; label: string }[] = [
  {
    keywords: ["nba", "basketball", "lakers", "warriors", "lebron", "nba mvp", "nba teams"],
    hashtags: ["#NBA", "#Basketball", "#LoPiPo"],
    label: "NBA",
  },
  {
    keywords: ["premier league", "epl", "arsenal", "chelsea", "manchester", "liverpool", "tottenham"],
    hashtags: ["#PremierLeague", "#EPL", "#Football", "#LoPiPo"],
    label: "Premier League",
  },
  {
    keywords: ["nfl", "american football", "super bowl", "nfl playoffs", "quarterback"],
    hashtags: ["#NFL", "#SuperBowl", "#LoPiPo"],
    label: "NFL",
  },
  {
    keywords: ["world cup", "fifa", "soccer", "football teams", "mls"],
    hashtags: ["#WorldCup", "#FIFA", "#Soccer", "#LoPiPo"],
    label: "Football",
  },
  {
    keywords: ["formula 1", "f1", "ferrari", "mercedes", "verstappen", "hamilton"],
    hashtags: ["#F1", "#Formula1", "#LoPiPo"],
    label: "F1",
  },
  {
    keywords: ["tennis", "wimbledon", "us open", "grand slam", "djokovic", "federer", "serena"],
    hashtags: ["#Tennis", "#Wimbledon", "#LoPiPo"],
    label: "Tennis",
  },
  {
    keywords: ["boxing", "mma", "ufc", "fight"],
    hashtags: ["#MMA", "#UFC", "#LoPiPo"],
    label: "MMA/Boxing",
  },
]

export function detectSportHashtags(topic: string): string[] {
  const lower = topic.toLowerCase()
  for (const sport of SPORT_TAG_MAP) {
    if (sport.keywords.some((kw) => lower.includes(kw))) {
      return sport.hashtags
    }
  }
  return ["#LoPiPo", "#Poll"]
}

export function isSportsTopic(topic: string): boolean {
  const lower = topic.toLowerCase()
  const allKeywords = SPORT_TAG_MAP.flatMap((s) => s.keywords)
  const sportGeneral = ["sport", "team", "player", "league", "championship", "tournament", "match", "game", "season"]
  return allKeywords.some((kw) => lower.includes(kw)) || sportGeneral.some((kw) => lower.includes(kw))
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generatePollId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function formatTimeLeft(expiresAt: Date | null): string {
  if (!expiresAt) return "No expiry"
  const ms = expiresAt.getTime() - Date.now()
  if (ms <= 0) return "Expired"
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  if (h > 0) return `${h}h ${m}m left`
  if (m > 0) return `${m}m ${s}s left`
  return `${s}s left`
}

function buildShareText(poll: LivePoll, url: string): string {
  const tags = poll.hashtags.join(" ")
  return `Who wins it all? Vote now on LoPiPo!\n${poll.title}\n👉 ${url}\n${tags}`
}

function buildPollUrl(id: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "https://lopipo.com"
  return `${base}/poll/${id}`
}

// ─── Simulated live vote updates ──────────────────────────────────────────────
// After the first real vote, trickle in simulated votes to show "live" feel.

function simulateVotes(
  poll: LivePoll,
  setPoll: React.Dispatch<React.SetStateAction<LivePoll | null>>
) {
  const totalSimulated = Math.floor(Math.random() * 40) + 10
  let added = 0
  const interval = setInterval(() => {
    if (added >= totalSimulated) {
      clearInterval(interval)
      return
    }
    const batchSize = Math.floor(Math.random() * 3) + 1
    added += batchSize
    setPoll((prev) => {
      if (!prev) return prev
      const updated = [...prev.options]
      for (let i = 0; i < batchSize; i++) {
        // Weight top options more to create a leading result
        const weights = updated.map((_, idx) => Math.max(updated.length - idx, 1))
        const total = weights.reduce((a, b) => a + b, 0)
        let rand = Math.random() * total
        let chosen = 0
        for (let j = 0; j < weights.length; j++) {
          rand -= weights[j]
          if (rand <= 0) { chosen = j; break }
        }
        updated[chosen] = { ...updated[chosen], votes: updated[chosen].votes + 1 }
      }
      const newTotal = updated.reduce((a, o) => a + o.votes, 0)
      return { ...prev, options: updated, totalVotes: newTotal }
    })
  }, 800)
  return interval
}

// ─── Duration options ─────────────────────────────────────────────────────────

const DURATION_OPTIONS = [
  { label: "30 min", value: 30 },
  { label: "1 hr", value: 60 },
  { label: "6 hrs", value: 360 },
  { label: "24 hrs", value: 1440 },
  { label: "No expiry", value: null },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function LivePollPanel({ open, onClose, topic, results, onPollCreated }: LivePollPanelProps) {
  const [view, setView] = useState<"setup" | "live">("setup")
  const [pollTitle, setPollTitle] = useState("")
  const [duration, setDuration] = useState<number | null>(60)
  const [poll, setPoll] = useState<LivePoll | null>(null)
  const [copied, setCopied] = useState(false)
  const [voterName, setVoterName] = useState("")
  const [nameError, setNameError] = useState("")
  const [timeLeft, setTimeLeft] = useState("")
  const [shareMsg, setShareMsg] = useState("")
  const [msgCopied, setMsgCopied] = useState(false)
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isSports = isSportsTopic(topic)

  useEffect(() => {
    if (open) {
      setPollTitle(topic ? `Who is the best ${topic}?` : "")
      setView("setup")
      setPoll(null)
      setCopied(false)
      setVoterName("")
      setNameError("")
      setShareMsg("")
      if (simIntervalRef.current) clearInterval(simIntervalRef.current)
    }
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current)
    }
  }, [open, topic])

  // Countdown timer
  useEffect(() => {
    if (!poll) return
    const interval = setInterval(() => setTimeLeft(formatTimeLeft(poll.expiresAt)), 1000)
    setTimeLeft(formatTimeLeft(poll.expiresAt))
    return () => clearInterval(interval)
  }, [poll])

  const handleCreatePoll = () => {
    if (!pollTitle.trim() || results.length === 0) return
    const hashtags = detectSportHashtags(topic)
    const id = generatePollId()
    const newPoll: LivePoll = {
      id,
      title: pollTitle.trim(),
      topic,
      hashtags,
      options: results.map((r) => ({ id: r.id, label: r.label, emoji: r.emoji, votes: 0 })),
      expiresAt: duration ? new Date(Date.now() + duration * 60 * 1000) : null,
      createdAt: new Date(),
      totalVotes: 0,
      votedOptionId: null,
    }
    setPoll(newPoll)
    setShareMsg(buildShareText(newPoll, buildPollUrl(id)))
    setView("live")
    onPollCreated?.(newPoll)
    // Start simulated live votes after 2s
    setTimeout(() => {
      simIntervalRef.current = simulateVotes(newPoll, setPoll)
    }, 2000)
  }

  const handleVote = (optionId: number) => {
    if (!poll || poll.votedOptionId !== null) return
    if (!voterName.trim()) { setNameError("Enter your name to vote."); return }
    const expired = poll.expiresAt && poll.expiresAt.getTime() < Date.now()
    if (expired) return
    setNameError("")
    setPoll((prev) => {
      if (!prev) return prev
      const updated = prev.options.map((o) =>
        o.id === optionId ? { ...o, votes: o.votes + 1 } : o
      )
      return { ...prev, options: updated, totalVotes: prev.totalVotes + 1, votedOptionId: optionId }
    })
  }

  const handleCopyLink = () => {
    if (!poll) return
    navigator.clipboard.writeText(buildPollUrl(poll.id)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleCopyMsg = () => {
    navigator.clipboard.writeText(shareMsg).then(() => {
      setMsgCopied(true)
      setTimeout(() => setMsgCopied(false), 2000)
    })
  }

  const handleShareTwitter = () => {
    if (!poll) return
    const url = buildPollUrl(poll.id)
    const text = encodeURIComponent(buildShareText(poll, url))
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank")
  }

  const handleShareFireside = () => {
    if (!poll) return
    const url = buildPollUrl(poll.id)
    const text = encodeURIComponent(buildShareText(poll, url))
    window.open(`https://fireside.fm/?share=${text}`, "_blank")
  }

  const maxVotes = poll ? Math.max(...poll.options.map((o) => o.votes), 1) : 1
  const leader = poll && poll.totalVotes > 0
    ? poll.options.reduce((a, b) => (a.votes >= b.votes ? a : b))
    : null

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full sm:max-w-lg bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0 bg-gradient-primary">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Vote size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Live Poll</p>
              <p className="text-[11px] text-white/70">
                {view === "setup" ? "Set up your poll" : "Results updating live"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSports && view === "setup" && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/20 text-white">
                Sports Poll
              </span>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        {poll && (
          <div className="flex border-b border-border shrink-0">
            {(["setup", "live"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setView(tab)}
                className={`flex-1 py-2.5 text-xs font-bold transition-colors
                  ${view === tab
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {tab === "setup" ? "Setup" : (
                  <span className="flex items-center justify-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                    Live Results
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="overflow-y-auto flex-1">

          {/* ── SETUP VIEW ── */}
          {view === "setup" && (
            <div className="px-5 py-5 flex flex-col gap-5">

              {/* Sports badge */}
              {isSports && (
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-amber-200 bg-amber-50">
                  <Trophy size={14} className="text-amber-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-800">Sports topic detected</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Hashtags will be auto-tagged: {detectSportHashtags(topic).join(" ")}
                    </p>
                  </div>
                </div>
              )}

              {/* Poll Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Poll Question
                </label>
                <input
                  type="text"
                  value={pollTitle}
                  onChange={(e) => setPollTitle(e.target.value)}
                  placeholder="e.g. Who wins the championship?"
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
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {results.map((r) => (
                    <div key={r.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-muted border border-border/50">
                      <span className="text-base leading-none">{r.emoji}</span>
                      <span className="text-sm font-medium text-foreground">{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Duration</label>
                <div className="flex flex-wrap gap-2">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={String(opt.value)}
                      onClick={() => setDuration(opt.value)}
                      style={duration === opt.value ? { background: "linear-gradient(135deg,#E8520A,#FF6B4A)", color: "#fff", borderColor: "transparent" } : {}}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                        ${duration === opt.value
                          ? "shadow-glow-primary"
                          : "bg-muted text-muted-foreground border-border hover:bg-orange-50 hover:text-primary hover:border-primary/40"
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Launch */}
              <button
                onClick={handleCreatePoll}
                disabled={!pollTitle.trim() || results.length === 0}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-primary shadow-glow-primary"
              >
                <TrendingUp size={15} />
                Launch Live Poll
              </button>
            </div>
          )}

          {/* ── LIVE VIEW ── */}
          {view === "live" && poll && (
            <div className="px-5 py-5 flex flex-col gap-5">

              {/* Poll meta */}
              <div>
                <h3 className="text-base font-bold text-foreground text-pretty leading-snug">{poll.title}</h3>
                <div className="flex items-center flex-wrap gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Users size={11} />
                    <span className="font-semibold text-foreground">{poll.totalVotes.toLocaleString()}</span> votes
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock size={11} />
                    {timeLeft}
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                    </span>
                    <span className="text-primary font-semibold">Live</span>
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {poll.hashtags.map((tag) => (
                      <span key={tag} className="text-[10px] font-semibold text-primary/80">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Leader card */}
              {leader && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                  <Trophy size={16} className="text-amber-600 shrink-0" />
                  <div>
                    <p className="text-[11px] text-amber-700 font-semibold uppercase tracking-wide">Currently Leading</p>
                    <p className="text-sm font-bold text-amber-900">
                      {leader.emoji} {leader.label}
                    </p>
                  </div>
                  <span className="ml-auto text-sm font-bold text-amber-700">
                    {poll.totalVotes > 0 ? Math.round((leader.votes / poll.totalVotes) * 100) : 0}%
                  </span>
                </div>
              )}

              {/* Voter name */}
              {poll.votedOptionId === null && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Your Name</label>
                  <input
                    type="text"
                    value={voterName}
                    onChange={(e) => { setVoterName(e.target.value); setNameError("") }}
                    placeholder="Enter your name to cast your vote"
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  />
                  {nameError && <p className="text-xs text-destructive">{nameError}</p>}
                </div>
              )}

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

              {/* Vote bars */}
              <div className="flex flex-col gap-2">
                {[...poll.options]
                  .sort((a, b) => b.votes - a.votes)
                  .map((option, rank) => {
                    const pct = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0
                    const isLeader = option.votes === maxVotes && poll.totalVotes > 0
                    const isVoted = poll.votedOptionId === option.id
                    const canVote = poll.votedOptionId === null && !(poll.expiresAt && poll.expiresAt.getTime() < Date.now())

                    return (
                      <button
                        key={option.id}
                        onClick={() => handleVote(option.id)}
                        disabled={!canVote}
                        className={`w-full text-left rounded-xl border p-3 transition-all relative overflow-hidden
                          ${isVoted ? "border-primary bg-primary/5"
                            : canVote ? "border-border bg-card hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                            : "border-border bg-card cursor-default"
                          }`}
                      >
                        {/* Progress bar fill */}
                        {poll.totalVotes > 0 && (
                          <div
                            className="absolute inset-y-0 left-0 rounded-xl transition-all duration-700 ease-out"
                            style={{
                              width: `${pct}%`,
                              background: isLeader
                                ? "linear-gradient(90deg,rgba(232,82,10,0.15),rgba(255,107,74,0.1))"
                                : "rgba(245,166,35,0.12)"
                            }}
                          />
                        )}
                        <div className="relative flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2">
                            <span className="text-lg leading-none">{option.emoji}</span>
                            <span className="text-sm font-semibold text-foreground">{option.label}</span>
                            {isLeader && poll.totalVotes > 0 && rank === 0 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                Leading
                              </span>
                            )}
                          </span>
                          <span className="flex items-center gap-2 shrink-0">
                            {poll.totalVotes > 0 && (
                              <span className="text-xs font-bold text-foreground">{pct}%</span>
                            )}
                            {canVote && (
                              <span className="text-[10px] font-bold text-primary">Vote</span>
                            )}
                          </span>
                        </div>
                        {poll.totalVotes > 0 && (
                          <p className="relative text-[11px] text-muted-foreground mt-1 pl-7">
                            {option.votes.toLocaleString()} vote{option.votes !== 1 ? "s" : ""}
                          </p>
                        )}
                      </button>
                    )
                  })}
              </div>

              {/* Share section */}
              <div className="flex flex-col gap-3 pt-1 border-t border-border">
                <p className="text-xs font-bold text-foreground uppercase tracking-wide">Share This Poll</p>

                {/* Share message box */}
                <div className="relative">
                  <textarea
                    readOnly
                    value={shareMsg}
                    rows={4}
                    className="w-full rounded-xl border border-input bg-muted px-4 py-3 text-xs text-foreground resize-none font-mono leading-relaxed focus:outline-none"
                  />
                  <button
                    onClick={handleCopyMsg}
                    className={`absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all
                      ${msgCopied ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}
                  >
                    {msgCopied ? <Check size={10} /> : <Link2 size={10} />}
                    {msgCopied ? "Copied" : "Copy"}
                  </button>
                </div>

                {/* One-tap share buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handleShareTwitter}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#1DA1F2] text-white text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    <Twitter size={13} />
                    Tweet
                  </button>
                  <button
                    onClick={handleShareFireside}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#FF4500] text-white text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    <Flame size={13} />
                    Fireside
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all
                      ${copied ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-muted border-border text-muted-foreground hover:text-foreground"}`}
                  >
                    {copied ? <Check size={13} /> : <Share2 size={13} />}
                    {copied ? "Copied!" : "Link"}
                  </button>
                </div>

                <p className="text-center text-[10px] text-muted-foreground">
                  Public link — no login required to vote{" "}
                  <span className="font-mono font-semibold">lopipo.com/poll/{poll.id}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
