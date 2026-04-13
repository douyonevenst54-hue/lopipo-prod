import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — LoPiPo",
  description: "How LoPiPo collects, uses, and protects your information.",
}

const SECTIONS = [
  {
    title: "1. Information We Collect",
    content: [
      {
        subtitle: "Pi Network Authentication",
        text: "LoPiPo uses the Pi Network SDK to authenticate users. During sign-in we receive your Pi username and a unique user identifier provided by the Pi Network platform. We do not receive or store your Pi wallet private keys or password.",
      },
      {
        subtitle: "Game & Poll Activity",
        text: "When you generate a game, create a poll, or purchase a lottery ticket we collect the topic you entered, the options generated, and any name you voluntarily provide for ticket purchases. Vote counts are stored in aggregate and are not linked to your identity.",
      },
      {
        subtitle: "Usage Data",
        text: "We may collect anonymous usage data such as feature interactions and error reports to improve the app. This data contains no personally identifiable information.",
      },
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: [
      {
        subtitle: "Core Functionality",
        text: "Your Pi username is used solely to authenticate your session and display your name inside the app. It is never sold, rented, or shared with third-party advertisers.",
      },
      {
        subtitle: "Lottery & Lotto",
        text: "Names submitted when buying lottery or lotto tickets are stored only to identify winners at draw time. Winners may be displayed publicly inside the app as part of the draw result.",
      },
      {
        subtitle: "Polls",
        text: "Poll results and vote counts are displayed publicly to anyone who accesses the poll link. Individual votes are not attributed to specific users.",
      },
    ],
  },
  {
    title: "3. Pi Network Payments",
    content: [
      {
        subtitle: "Ticket Purchases",
        text: "Lottery and Lotto ticket purchases are processed through the Pi Network payment system. LoPiPo does not handle or store Pi payment credentials. All Pi transactions are governed by Pi Network's own terms of service and privacy policy.",
      },
      {
        subtitle: "Prize Pools",
        text: "A portion of each ticket purchase (0.45 Pi per 0.50 Pi ticket) is allocated to the prize pool. Prize distribution is managed transparently within the app and governed by the draw rules set by series administrators.",
      },
    ],
  },
  {
    title: "4. Data Sharing",
    content: [
      {
        subtitle: "No Third-Party Advertising",
        text: "We do not share your personal data with advertisers or data brokers.",
      },
      {
        subtitle: "Service Providers",
        text: "We may use trusted service providers (such as database and hosting providers) to operate LoPiPo. These providers process data only on our behalf and are contractually required to protect your information.",
      },
      {
        subtitle: "Legal Requirements",
        text: "We may disclose information if required by law or in response to a valid legal request from public authorities.",
      },
    ],
  },
  {
    title: "5. Data Retention",
    content: [
      {
        subtitle: "Active Data",
        text: "Game topics, poll results, and lottery ticket records are retained while the relevant series or poll is active.",
      },
      {
        subtitle: "Completed Series",
        text: "Completed lottery and lotto series records, including winner information, are retained for a period of 90 days after the draw date for audit purposes, then permanently deleted.",
      },
      {
        subtitle: "Account Data",
        text: "Your Pi username and session data are removed automatically when you sign out. We do not retain session tokens after logout.",
      },
    ],
  },
  {
    title: "6. Security",
    content: [
      {
        subtitle: "Technical Safeguards",
        text: "LoPiPo uses industry-standard security practices including encrypted data transmission (HTTPS), server-side input validation, and parameterised database queries to protect against unauthorised access.",
      },
      {
        subtitle: "No Guarantees",
        text: "While we take security seriously, no system is completely secure. We encourage you to use the Pi Network's built-in security features to protect your account.",
      },
    ],
  },
  {
    title: "7. Children's Privacy",
    content: [
      {
        subtitle: "Age Requirement",
        text: "LoPiPo is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.",
      },
    ],
  },
  {
    title: "8. Your Rights",
    content: [
      {
        subtitle: "Access & Deletion",
        text: "You may request a copy of the personal information we hold about you, or request its deletion, by contacting us at the address below. We will respond within 30 days.",
      },
      {
        subtitle: "Opt-Out",
        text: "You may stop using LoPiPo at any time. Because authentication is handled by the Pi Network, revoking LoPiPo's access can be managed through your Pi Network account settings.",
      },
    ],
  },
  {
    title: "9. Changes to This Policy",
    content: [
      {
        subtitle: "Updates",
        text: "We may update this Privacy Policy from time to time. When we do, we will revise the 'Last Updated' date at the top of this page. Continued use of LoPiPo after changes are posted constitutes your acceptance of the revised policy.",
      },
    ],
  },
  {
    title: "10. Contact Us",
    content: [
      {
        subtitle: "Get In Touch",
        text: "If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please reach out to the LoPiPo team through the Pi Network developer contact channels or via the in-app feedback feature.",
      },
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
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

      <div className="max-w-3xl mx-auto px-4 py-10 pb-20 relative flex flex-col gap-8">

        {/* Hero */}
        <section className="flex flex-col gap-2">
          <h1 className="text-4xl font-display font-bold text-gradient text-balance leading-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Last updated: March 12, 2026
          </p>
        </section>

        {/* Intro card */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <p className="text-sm text-foreground leading-relaxed">
            LoPiPo (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is an AI-powered game generator built on the Pi Network ecosystem.
            This Privacy Policy explains what information we collect when you use LoPiPo, how we use it,
            and the choices you have. We are committed to protecting your privacy and handling your data
            with transparency and care.
          </p>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-6">
          {SECTIONS.map((section) => (
            <section key={section.title} className="flex flex-col gap-3">
              <h2 className="text-base font-display font-bold text-foreground">
                {section.title}
              </h2>
              <div className="flex flex-col gap-3">
                {section.content.map((item) => (
                  <div
                    key={item.subtitle}
                    className="bg-card rounded-xl border border-border p-4 flex flex-col gap-1 shadow-sm"
                  >
                    <h3 className="text-sm font-semibold text-primary">
                      {item.subtitle}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer note */}
        <div
          className="rounded-2xl p-5 text-center flex flex-col gap-2"
          style={{ background: "linear-gradient(135deg,rgba(232,82,10,0.08),rgba(255,107,74,0.08))", border: "1px solid rgba(232,82,10,0.15)" }}
        >
          <p className="text-sm font-semibold text-foreground">
            Thank you for trusting LoPiPo
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your privacy matters to us. We will always be transparent about how your data is used
            and give you control over your information.
          </p>
  <div className="flex items-center justify-center gap-3 flex-wrap mt-1">
    <Link
      href="/"
      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-primary shadow-glow-primary hover:opacity-90 transition-opacity"
    >
      Back to LoPiPo
    </Link>
    <Link
      href="/terms"
      className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold text-primary border border-primary/30 hover:bg-primary/5 transition-colors"
    >
      Terms of Service
    </Link>
  </div>
  </div>

      </div>
    </div>
  )
}
