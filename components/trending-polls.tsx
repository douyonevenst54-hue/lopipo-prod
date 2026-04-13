"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Users, ChevronRight, Clock, Trophy } from "lucide-react"
import type { LivePoll } from "./live-poll-panel"

interface TrendingPollsProps {
  polls: LivePoll[]
  onVote: (poll: LivePoll) => void
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function makeSeedPolls(): LivePoll[] {
  return [
    {
      id: "nba001",
      title: "Who wins the NBA Championship this season?",
      topic: "NBA teams",
      hashtags: ["#NBA", "#Basketball", "#LoPiPo"],
      options: [
        { id: 1, label: "Boston Celtics", emoji: "🍀", votes: 312 },
        { id: 2, label: "Golden State Warriors", emoji: "⚡", votes: 287 },
        { id: 3, label: "LA Lakers", emoji: "💜", votes: 264 },
        { id: 4, label: "Denver Nuggets", emoji: "⛏️", votes: 198 },
      ],
      expiresAt: new Date(Date.now() + 3 * 3600000),
      createdAt: new Date(Date.now() - 2 * 3600000),
      totalVotes: 1061,
      votedOptionId: null,
    },
    {
      id: "epl001",
      title: "Best Premier League team of 2025?",
      topic: "Premier League",
      hashtags: ["#PremierLeague", "#EPL", "#LoPiPo"],
      options: [
        { id: 1, label: "Arsenal", emoji: "🔴", votes: 445 },
        { id: 2, label: "Manchester City", emoji: "🔵", votes: 398 },
        { id: 3, label: "Liverpool", emoji: "🦅", votes: 376 },
        { id: 4, label: "Chelsea", emoji: "💙", votes: 201 },
      ],
      expiresAt: new Date(Date.now() + 5 * 3600000),
      createdAt: new Date(Date.now() - 4 * 3600000),
      totalVotes: 1420,
      votedOptionId: null,
    },
    {
      id: "nfl001",
      title: "NFL Super Bowl favorites?",
      topic: "NFL playoffs",
      hashtags: ["#NFL", "#SuperBowl", "#LoPiPo"],
      options: [
        { id: 1, label: "Kansas City Chiefs", emoji: "🏈", votes: 521 },
        { id: 2, label: "San Francisco 49ers", emoji: "🌉", votes: 388 },
        { id: 3, label: "Philadelphia Eagles", emoji: "🦅", votes: 302 },
        { id: 4, label: "Dallas Cowboys", emoji: "⭐", votes: 244 },
      ],
      expiresAt: new Date(Date.now() + 8 * 3600000),
      createdAt: new Date(Date.now() - 1 * 3600000),
      totalVotes: 1455,
      votedOptionId: null,
    },
  ]
}

export function TrendingPolls({ polls, onVote }: TrendingPollsProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  // Seed polls are stateful so inline votes update the counters in real time
  const [seedPolls, setSeedPolls] = useState<LivePoll[]>(makeSeedPolls)

  // Trickle 1 vote into a random seed poll option every ~8–14 s to show live movement
  useEffect(() => {
    const tick = () => {
      setSeedPolls((prev) => {
        const idx = Math.floor(Math.random() * prev.length)
        const poll = prev[idx]
        const optIdx = Math.floor(Math.random() * poll.options.length)
        const updated = poll.options.map((o, i) =>
          i === optIdx ? { ...o, votes: o.votes + 1 } : o
        )
        const newTotal = updated.reduce((a, o) => a + o.votes, 0)
        const newPoll = { ...poll, options: updated, totalVotes: newTotal }
        return prev.map((p, i) => (i === idx ? newPoll : p))
      })
    }
    const id = setInterval(tick, 8000 + Math.random() * 6000)
    return () => clearInterval(id)
  }, [])

  // Allow inline voting on seed polls directly in the card
  const handleInlineVote = (pollId: string, optionId: number) => {
    setSeedPolls((prev) =>
      prev.map((p) => {
        if (p.id !== pollId || p.votedOptionId !== null) return p
        const updated = p.options.map((o) =>
          o.id === optionId ? { ...o, votes: o.votes + 1 } : o
        )
        return { ...p, options: updated, totalVotes: p.totalVotes + 1, votedOptionId: optionId }
      })
    )
  }

  // Merge user-created polls first, then seed polls
  const allPolls = [...polls, ...seedPolls].slice(0, 6)

  if (allPolls.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow-primary">
            <TrendingUp size={13} className="text-white" />
          </div>
          <h2 className="text-base font-display font-bold text-foreground">Trending Polls</h2>
          <span className="relative flex h-2 w-2 ml-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground font-medium">Live · {allPolls.length} active</span>
      </div>

      {/* Poll cards */}
      <div className="flex flex-col gap-2.5">
        {allPolls.map((poll) => {
          const leader = [...poll.options].sort((a, b) => b.votes - a.votes)[0]
          const leaderPct = poll.totalVotes > 0
            ? Math.round((leader.votes / poll.totalVotes) * 100)
            : 0
          const isExpanded = expanded === poll.id
          const isExpiring = poll.expiresAt
            ? (poll.expiresAt.getTime() - Date.now()) < 3600000
            : false

          return (
            <div
              key={poll.id}
              className="bg-card border border-border rounded-2xl overflow-hidden transition-all hover:border-primary/30 hover:shadow-sm"
            >
              {/* Card header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : poll.id)}
                className="w-full text-left px-4 pt-3.5 pb-3 flex items-start justify-between gap-3"
                aria-expanded={isExpanded}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground text-pretty leading-snug">
                    {poll.title}
                  </p>
                  <div className="flex items-center flex-wrap gap-2.5 mt-1.5">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Users size={10} />
                      {poll.totalVotes.toLocaleString()} votes
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock size={10} />
                      {timeAgo(poll.createdAt)}
                    </span>
                    {isExpiring && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                        Ending soon
                      </span>
                    )}
                    <div className="flex gap-1">
                      {poll.hashtags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[10px] font-semibold text-primary/70">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <ChevronRight
                  size={15}
                  className={`text-muted-foreground transition-transform shrink-0 mt-0.5 ${isExpanded ? "rotate-90" : ""}`}
                />
              </button>

              {/* Leader mini-bar (collapsed state) */}
              {!isExpanded && (
                <div className="px-4 pb-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Trophy size={11} className="text-amber-500" />
                      {leader.emoji} {leader.label}
                    </span>
                    <span className="text-xs font-bold text-primary">{leaderPct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-primary transition-all duration-700"
                      style={{ width: `${leaderPct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Expanded options */}
              {isExpanded && (() => {
                const isSeed = seedPolls.some((s) => s.id === poll.id)
                const hasVoted = poll.votedOptionId !== null
                return (
                  <div className="px-4 pb-4 flex flex-col gap-2 border-t border-border pt-3">
                    {[...poll.options]
                      .sort((a, b) => b.votes - a.votes)
                      .map((option, rank) => {
                        const pct = poll.totalVotes > 0
                          ? Math.round((option.votes / poll.totalVotes) * 100)
                          : 0
                        const isVoted = poll.votedOptionId === option.id
                        return (
                          <div key={option.id} className="flex items-center gap-2.5">
                            <span className="text-sm leading-none w-5 shrink-0">{option.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-semibold truncate ${isVoted ? "text-primary" : "text-foreground"}`}>
                                  {option.label}
                                  {isVoted && <span className="ml-1.5 text-[10px] text-primary font-bold">(your vote)</span>}
                                </span>
                                <span className="text-xs font-bold text-muted-foreground ml-2 shrink-0">
                                  {pct}% · {option.votes.toLocaleString()}
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-700"
                                  style={{
                                    width: `${pct}%`,
                                    background: rank === 0
                                      ? "linear-gradient(90deg,#E8520A,#FF6B4A)"
                                      : "rgba(245,166,35,0.5)"
                                  }}
                                />
                              </div>
                            </div>
                            {/* Inline vote button for seed polls */}
                            {isSeed && !hasVoted && (
                              <button
                                onClick={() => handleInlineVote(poll.id, option.id)}
                                className="shrink-0 px-2 py-1 rounded-lg text-[10px] font-bold border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                                aria-label={`Vote for ${option.label}`}
                              >
                                Vote
                              </button>
                            )}
                          </div>
                        )
                      })}

                    {hasVoted ? (
                      <p className="text-center text-xs font-semibold text-primary mt-1">
                        Thanks for voting! Results update live.
                      </p>
                    ) : !isSeed ? (
                      <button
                        onClick={() => onVote(poll)}
                        className="mt-1 w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-primary shadow-glow-primary hover:opacity-90 transition-opacity active:scale-[0.98]"
                      >
                        Cast Your Vote
                      </button>
                    ) : null}
                  </div>
                )
              })()}
            </div>
          )
        })}
      </div>
    </section>
  )
}
