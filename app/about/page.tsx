import Link from "next/link"
import type { Metadata } from "next"
import { Gamepad2, Vote, Ticket, TrendingUp, ShieldCheck, Zap, Users, Globe } from "lucide-react"

export const metadata: Metadata = {
  title: "About — LoPiPo",
  description:
    "Learn about LoPiPo, the AI-powered game and poll generator built on the Pi Network ecosystem.",
}

const FEATURES = [
  {
    icon: Gamepad2,
    title: "AI Game Generator",
    description:
      "Type any topic and LoPiPo instantly generates a set of lottery-style options powered by AI. From sports teams to pizza toppings — any topic becomes a game.",
  },
  {
    icon: Vote,
    title: "Live Polls",
    description:
      "Turn any generated game into a shareable live poll. Share it with your team or community and watch votes roll in from anywhere — no account required to vote.",
  },
  {
    icon: Ticket,
    title: "Official Lottery",
    description:
      "Buy tickets in developer-managed lottery series using Pi. Each ticket contributes 0.45 Pi to the prize pool. Draws are automatic and winners are listed publicly.",
  },
  {
    icon: TrendingUp,
    title: "Trending Polls",
    description:
      "Browse the most active community polls on the home screen. Vote directly from the card and see live result bars update in real time.",
  },
  {
    icon: ShieldCheck,
    title: "Pi Network Native",
    description:
      "LoPiPo is built for the Pi Browser. Authentication and payments are handled entirely through the Pi Network SDK — no separate account needed.",
  },
  {
    icon: Zap,
    title: "Lotto 3-Digit Draw",
    description:
      "Pick three digits from 000 to 999, enter your name, and pay 0.5 Pi. Each ticket adds 0.45 Pi to the cumulative prize pool for that series.",
  },
]

const STATS = [
  { value: "Pi Network", label: "Platform" },
  { value: "0.5 Pi", label: "Ticket Price" },
  { value: "0.45 Pi", label: "Goes to Prize Pool" },
  { value: "Auto-draw", label: "Scheduled Draws" },
]

const TEAM = [
  {
    role: "Concept & Product",
    description:
      "Designed to make group decisions fun, democratic, and engaging — powered by AI and the Pi community.",
  },
  {
    role: "Development",
    description:
      "Built with Next.js, Tailwind CSS, and the Pi Network SDK. Deployed on Vercel for fast global load times.",
  },
  {
    role: "Community",
    description:
      "Shaped by Pi Network pioneers who believe entertainment and utility should go hand in hand.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background font-sans relative overflow-x-hidden">
      {/* Ambient blobs */}
      <div className="blob-accent w-96 h-96 -top-24 -left-24 fixed" aria-hidden="true" />
      <div className="blob-accent w-64 h-64 bottom-0 right-0 fixed" aria-hidden="true" />

      {/* Header */}
      <header className="w-full border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🎰</span>
            <span className="text-xl font-display font-bold text-gradient tracking-tight">LoPiPo</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            Back to app
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10 pb-20 relative flex flex-col gap-12">

        {/* Hero */}
        <section className="flex flex-col gap-4 text-center items-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-glow-primary"
            style={{ background: "linear-gradient(135deg,#E8520A,#FF6B4A)" }}
            aria-hidden="true"
          >
            🎰
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-display font-bold text-gradient text-balance leading-tight">
              About LoPiPo
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed max-w-lg text-pretty">
              LoPiPo is an AI-powered game and poll generator built on the Pi Network. Turn any topic
              into an instant lottery, poll, or community vote — in seconds.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-primary shadow-glow-primary hover:opacity-90 transition-opacity"
          >
            <Gamepad2 size={15} />
            Try LoPiPo Now
          </Link>
        </section>

        {/* Stats strip */}
        <section
          className="rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-4"
          style={{
            background: "linear-gradient(135deg,rgba(232,82,10,0.07),rgba(255,107,74,0.07))",
            border: "1px solid rgba(232,82,10,0.15)",
          }}
          aria-label="Key statistics"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
              <span className="text-xl font-display font-bold text-gradient leading-tight">
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
            </div>
          ))}
        </section>

        {/* Mission */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#E8520A,#FF6B4A)" }}
              aria-hidden="true"
            >
              <Globe size={15} className="text-white" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">Our Mission</h2>
          </div>
          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm flex flex-col gap-3">
            <p className="text-sm text-foreground leading-relaxed">
              LoPiPo was built around one simple idea: every group decision, debate, or competition
              should be more fun. Whether you are picking a team name, settling a sports argument, or
              running a community giveaway — LoPiPo makes it effortless.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By combining AI-generated content with Pi Network&apos;s growing ecosystem of real
              users and real payments, LoPiPo bridges entertainment with genuine community engagement.
              Every poll shared is a conversation started. Every ticket purchased is a community
              prize pool growing.
            </p>
          </div>
        </section>

        {/* Features grid */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#E8520A,#FF6B4A)" }}
              aria-hidden="true"
            >
              <Zap size={15} className="text-white" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">What LoPiPo Does</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="bg-card rounded-2xl border border-border p-4 flex flex-col gap-2 shadow-sm hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "linear-gradient(135deg,rgba(232,82,10,0.12),rgba(255,107,74,0.12))" }}
                    >
                      <Icon size={14} className="text-primary" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">{feature.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#E8520A,#FF6B4A)" }}
              aria-hidden="true"
            >
              <TrendingUp size={15} className="text-white" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">How It Works</h2>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { step: "01", title: "Pick a topic", detail: "Type anything — a sport, a food, a game — or choose from quick picks." },
              { step: "02", title: "AI generates options", detail: "The AI instantly creates a set of relevant, fun, and distinct options for your topic." },
              { step: "03", title: "Share or play", detail: "Share as a live poll with a unique URL, create a lottery, or just enjoy the game with your group." },
              { step: "04", title: "Vote and win", detail: "Community members vote in real time. Lottery draws happen automatically at the scheduled time." },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-card rounded-xl border border-border p-4 flex items-start gap-4 shadow-sm"
              >
                <span
                  className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#E8520A,#FF6B4A)" }}
                >
                  {item.step}
                </span>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-bold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Built by */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#E8520A,#FF6B4A)" }}
              aria-hidden="true"
            >
              <Users size={15} className="text-white" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">Built by the Community</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TEAM.map((member) => (
              <div
                key={member.role}
                className="bg-card rounded-2xl border border-border p-4 flex flex-col gap-1.5 shadow-sm"
              >
                <h3 className="text-xs font-bold text-primary uppercase tracking-wide">
                  {member.role}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pi Network section */}
        <section
          className="rounded-2xl p-6 flex flex-col gap-3"
          style={{
            background: "linear-gradient(135deg,rgba(232,82,10,0.07),rgba(255,107,74,0.07))",
            border: "1px solid rgba(232,82,10,0.15)",
          }}
        >
          <h2 className="text-lg font-display font-bold text-foreground">Built on Pi Network</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            LoPiPo is a native Pi Network app. Authentication, payments, and user identity are
            all handled through the Pi SDK. A Pi account is required to use the app, and all
            lottery ticket purchases are settled in Pi cryptocurrency. LoPiPo does not custody
            Pi on behalf of users — all payments flow through Pi Network&apos;s own infrastructure.
          </p>
          <div className="flex flex-wrap gap-2 mt-1">
            {["Pi SDK Auth", "Pi Payments", "Pi Browser Ready", "Pi App Directory"].map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full border"
                style={{
                  borderColor: "rgba(232,82,10,0.25)",
                  color: "#E8520A",
                  background: "rgba(232,82,10,0.06)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#E8520A,#FF6B4A)" }}
              aria-hidden="true"
            >
              <ShieldCheck size={15} className="text-white" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">Contact & Support</h2>
          </div>
          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm flex flex-col gap-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Have a question, found a bug, or want to collaborate? Reach the LoPiPo team through
              the Pi Network developer contact channels or the in-app feedback feature. We read
              every message and aim to respond within 48 hours.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For legal enquiries — including data requests and copyright matters — please reference
              our Privacy Policy and Terms of Service pages.
            </p>
          </div>
        </section>

        {/* CTA footer */}
        <div className="text-center flex flex-col gap-4 items-center">
          <p className="text-sm text-muted-foreground text-pretty max-w-md">
            Ready to play? Generate your first game in under 10 seconds.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-primary shadow-glow-primary hover:opacity-90 transition-opacity"
            >
              <Gamepad2 size={15} />
              Launch LoPiPo
            </Link>
            <Link
              href="/terms"
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-primary border border-primary/30 hover:bg-primary/5 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-primary border border-primary/30 hover:bg-primary/5 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
