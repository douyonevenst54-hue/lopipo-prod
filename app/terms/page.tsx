import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service — LoPiPo",
  description: "The terms and conditions governing your use of LoPiPo on the Pi Network platform.",
}

const SECTIONS = [
  {
    number: "01",
    title: "Acceptance of Terms",
    content: [
      {
        subtitle: "Agreement to Be Bound",
        text: "By accessing or using LoPiPo you confirm that you are at least 18 years old (or the age of majority in your jurisdiction), that you have read and understood these Terms of Service in full, and that you agree to be legally bound by them. If you do not agree to these Terms, you must immediately stop using the app.",
      },
      {
        subtitle: "Capacity",
        text: "You represent that you have the legal capacity to enter into a binding agreement and that your use of LoPiPo does not violate any applicable law or regulation in your country or jurisdiction.",
      },
    ],
  },
  {
    number: "02",
    title: "Description of Service",
    content: [
      {
        subtitle: "What LoPiPo Offers",
        text: "LoPiPo is an AI-powered game and poll generator that operates within the Pi Network ecosystem. The platform enables users to generate lottery-style games and polls on any topic using AI, participate in community polls and vote on trending topics, purchase lottery and lotto tickets using Pi cryptocurrency, and browse live results and trending polls.",
      },
      {
        subtitle: "Platform Nature",
        text: "LoPiPo is an entertainment and community engagement platform. It is not a financial institution, investment platform, or gambling operator under any regulatory framework. All prize pool distributions are funded exclusively by ticket purchases from community participants.",
      },
      {
        subtitle: "Service Availability",
        text: "LoPiPo is provided on a best-efforts basis. We do not guarantee continuous, uninterrupted availability. The service may be modified, updated, or temporarily unavailable due to maintenance or Pi Network infrastructure issues.",
      },
    ],
  },
  {
    number: "03",
    title: "Pi Network Requirements",
    content: [
      {
        subtitle: "Pi Network Account Required",
        text: "LoPiPo uses the Pi Network SDK for user authentication. A valid Pi Network account is required to access the app. By using LoPiPo you also agree to Pi Network's own Terms of Service and Privacy Policy, which govern your Pi account and wallet.",
      },
      {
        subtitle: "Pi Payments",
        text: "All transactions within LoPiPo — including lottery and lotto ticket purchases — are conducted in Pi cryptocurrency via the Pi Network payment infrastructure. LoPiPo does not hold, custody, or control Pi on your behalf at any time. All confirmed payments are final.",
      },
      {
        subtitle: "Payment Disputes",
        text: "Any disputes, errors, or failures relating to Pi transactions must be raised directly with Pi Network through their official support channels. LoPiPo is not responsible for payment failures or delays caused by Pi Network infrastructure.",
      },
      {
        subtitle: "Wallet Responsibility",
        text: "You are solely responsible for maintaining the security of your Pi wallet and credentials. LoPiPo will never ask for your Pi wallet seed phrase or private keys.",
      },
    ],
  },
  {
    number: "04",
    title: "Lottery Rules",
    content: [
      {
        subtitle: "Ticket Purchases",
        text: "Standard lottery tickets are priced at 0.50 Pi each. Of each ticket sale, 0.45 Pi is allocated directly to the prize pool for the active series, and 0.05 Pi covers platform operating costs. Lotto tickets follow the same pricing structure. All purchases are final and non-refundable once confirmed on the Pi Network.",
      },
      {
        subtitle: "Series Management",
        text: "Lottery series are created and managed exclusively by authorised developers. Regular users may purchase tickets and verify results but may not create, modify, or delete series. Attempting to access developer controls without authorisation is a violation of these Terms.",
      },
      {
        subtitle: "Automated Draws",
        text: "Each series has a scheduled draw time set at the point of creation. Draws are executed automatically when the draw time is reached. Winners are selected through a random draw process. The result of every draw is final, binding, and not subject to appeal.",
      },
      {
        subtitle: "Prize Distribution",
        text: "The prize pool displayed for each series represents the cumulative sum of all 0.45 Pi contributions from ticket sales. Distribution to winners occurs as shown in the draw results. LoPiPo does not guarantee any minimum prize value as the pool is entirely dependent on ticket sales volume.",
      },
      {
        subtitle: "Tax Obligations",
        text: "Winners are solely responsible for declaring and paying any taxes, duties, or levies applicable to prize winnings under the laws of their jurisdiction. LoPiPo does not withhold or remit tax on behalf of winners.",
      },
      {
        subtitle: "Responsible Participation",
        text: "Purchasing a ticket does not guarantee a win. LoPiPo is an entertainment platform. Participate responsibly and only spend what you can afford to lose.",
      },
    ],
  },
  {
    number: "05",
    title: "User Conduct",
    content: [
      {
        subtitle: "Prohibited Activities",
        text: "You agree not to use LoPiPo to engage in any unlawful activity; attempt to gain unauthorised access to any part of the platform, its systems, or other users' data; reverse-engineer, decompile, or tamper with the app's code or infrastructure; interfere with or disrupt the integrity or performance of the app; impersonate any person or entity; transmit harmful, offensive, defamatory, or fraudulent content; or use the platform to facilitate money laundering or other financial crimes.",
      },
      {
        subtitle: "Poll Integrity",
        text: "Automated voting scripts, bots, or any mechanism designed to manipulate poll outcomes are strictly prohibited. Vote manipulation constitutes a material breach of these Terms and may result in immediate account suspension.",
      },
      {
        subtitle: "Developer Controls",
        text: "Developer-level features are restricted to authorised personnel with valid developer credentials. Sharing, distributing, or attempting to brute-force developer PINs or credentials is a serious violation of these Terms and may be referred to the relevant authorities.",
      },
    ],
  },
  {
    number: "06",
    title: "AI Generated Content",
    content: [
      {
        subtitle: "Nature of AI Output",
        text: "Game options, poll suggestions, and content generated by LoPiPo's AI are produced algorithmically and may not always be accurate, appropriate, or complete. AI-generated content does not represent the views or opinions of LoPiPo or its developers.",
      },
      {
        subtitle: "No Endorsement",
        text: "The appearance of any name, team, brand, or entity in AI-generated game outputs does not constitute endorsement, sponsorship, or affiliation with that party. All generated content is for entertainment purposes only.",
      },
      {
        subtitle: "Content Responsibility",
        text: "You are responsible for the topic prompts you submit to the AI. Do not submit prompts designed to generate harmful, offensive, or unlawful content. LoPiPo reserves the right to refuse or filter any prompt at its discretion.",
      },
      {
        subtitle: "Intellectual Output",
        text: "AI-generated outputs produced during your session belong to LoPiPo. You may share them for personal, non-commercial use but may not commercialise or republish them without written permission.",
      },
    ],
  },
  {
    number: "07",
    title: "Intellectual Property",
    content: [
      {
        subtitle: "LoPiPo Ownership",
        text: "All content, design, code, trademarks, branding, and materials within LoPiPo — including the name 'LoPiPo', its logo, AI engine, lottery infrastructure, and all related software — are the exclusive intellectual property of LoPiPo and its developers. Nothing in these Terms transfers any ownership rights to you.",
      },
      {
        subtitle: "Restrictions",
        text: "You may not reproduce, distribute, modify, create derivative works from, publicly display, or commercially exploit any part of LoPiPo without express prior written permission from LoPiPo.",
      },
      {
        subtitle: "User-Submitted Content",
        text: "By submitting topics, poll questions, ticket holder names, or any other input, you grant LoPiPo a perpetual, worldwide, non-exclusive, royalty-free licence to use, display, and process that content solely for the purpose of providing and improving the service.",
      },
    ],
  },
  {
    number: "08",
    title: "Disclaimers",
    content: [
      {
        subtitle: "As-Is Basis",
        text: "LoPiPo is provided on an 'as is' and 'as available' basis. To the maximum extent permitted by applicable law, LoPiPo makes no warranties, representations, or guarantees of any kind, whether express, implied, or statutory, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.",
      },
      {
        subtitle: "No Warranty of Accuracy",
        text: "We do not warrant that the app will be error-free, uninterrupted, secure, or free of viruses. We do not warrant the accuracy, completeness, or reliability of any AI-generated content, poll results, or lottery outcomes.",
      },
      {
        subtitle: "Third-Party Services",
        text: "LoPiPo integrates with Pi Network and other third-party services. We disclaim all liability for the availability, reliability, or conduct of such third-party platforms.",
      },
    ],
  },
  {
    number: "09",
    title: "Limitation of Liability",
    content: [
      {
        subtitle: "Exclusion of Damages",
        text: "To the fullest extent permitted by law, LoPiPo, its developers, officers, and affiliates shall not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages — including but not limited to loss of Pi, loss of data, loss of profits, or loss of goodwill — arising from your use of or inability to use the app, even if advised of the possibility of such damages.",
      },
      {
        subtitle: "Cap on Liability",
        text: "In any event, LoPiPo's total aggregate liability to you for any claims arising from these Terms or your use of the app shall not exceed the total amount of Pi you paid for tickets in the 30 days immediately preceding the event giving rise to the claim.",
      },
      {
        subtitle: "Essential Basis",
        text: "You acknowledge that the limitations of liability set out in this section are an essential element of the basis of the bargain between you and LoPiPo, without which LoPiPo would not have provided the service.",
      },
    ],
  },
  {
    number: "10",
    title: "Modifications to the Service",
    content: [
      {
        subtitle: "Right to Modify",
        text: "LoPiPo reserves the right to modify, suspend, or discontinue any aspect of the service at any time, with or without notice. This includes adding, removing, or altering features, lottery series structures, ticket pricing, and AI capabilities.",
      },
      {
        subtitle: "No Liability for Changes",
        text: "LoPiPo shall not be liable to you or any third party for any modification, suspension, or discontinuation of the service. Active lottery series will be honoured up to their scheduled draw time regardless of platform changes.",
      },
    ],
  },
  {
    number: "11",
    title: "Changes to These Terms",
    content: [
      {
        subtitle: "Right to Update",
        text: "We may revise these Terms of Service at any time. When we do, we will update the 'Last Updated' date at the top of this page. For material changes, we will make reasonable efforts to notify users through in-app notices.",
      },
      {
        subtitle: "Continued Use",
        text: "Your continued use of LoPiPo after any changes to these Terms take effect constitutes your binding acceptance of the revised Terms. If you do not agree to the updated Terms, you must stop using the app immediately.",
      },
    ],
  },
  {
    number: "12",
    title: "Governing Law",
    content: [
      {
        subtitle: "Applicable Law",
        text: "These Terms of Service are governed by and construed in accordance with applicable international law, given the global nature of the Pi Network ecosystem. Where local laws apply, they shall be interpreted to give maximum effect to the provisions of these Terms.",
      },
      {
        subtitle: "Dispute Resolution",
        text: "In the event of any dispute arising from or relating to these Terms or your use of LoPiPo, the parties agree to first attempt resolution through good-faith negotiation. If negotiation fails, disputes may be submitted to binding arbitration under mutually agreed rules.",
      },
      {
        subtitle: "Severability",
        text: "If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.",
      },
    ],
  },
  {
    number: "13",
    title: "Contact Us",
    content: [
      {
        subtitle: "Questions About These Terms",
        text: "If you have any questions, concerns, or feedback about these Terms of Service, please contact the LoPiPo team through the Pi Network developer contact channels or via the in-app feedback feature. We are committed to responding to all enquiries within a reasonable timeframe.",
      },
      {
        subtitle: "Reporting Violations",
        text: "To report a violation of these Terms — including suspected lottery fraud, vote manipulation, or unauthorised use of developer credentials — please contact us immediately through the same channels. All reports are treated with strict confidentiality.",
      },
    ],
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Ambient blobs */}
      <div className="blob-accent w-96 h-96 -top-24 -left-24 fixed" aria-hidden="true" />
      <div className="blob-accent w-64 h-64 bottom-0 right-0 fixed" aria-hidden="true" />

      {/* Header */}
      <header className="w-full border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
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
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Last updated: March 12, 2026
          </p>
        </section>

        {/* Intro card */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <p className="text-sm text-foreground leading-relaxed">
            Welcome to LoPiPo. By accessing or using our application on the Pi Network platform,
            you agree to be bound by these Terms of Service. Please read them carefully before using the app.
            These Terms form a legally binding agreement between you and LoPiPo.
          </p>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-6">
          {SECTIONS.map((section) => (
            <section key={section.title} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#E8520A,#FF6B4A)" }}
                >
                  {section.number}
                </span>
                <h2 className="text-base font-display font-bold text-foreground">
                  {section.title}
                </h2>
              </div>
              <div className="flex flex-col gap-3 pl-11">
                {section.content.map((item) => (
                  <div
                    key={item.subtitle}
                    className="bg-card rounded-xl border border-border p-4 flex flex-col gap-1.5 shadow-sm"
                  >
                    <h3 className="text-xs font-bold text-primary uppercase tracking-wide">
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
          style={{
            background: "linear-gradient(135deg,rgba(232,82,10,0.08),rgba(255,107,74,0.08))",
            border: "1px solid rgba(232,82,10,0.15)",
          }}
        >
          <p className="text-sm font-semibold text-foreground">
            Play fair. Have fun. Win big.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            By continuing to use LoPiPo you confirm you have read and agree to these Terms of Service.
          </p>
          <div className="flex items-center justify-center gap-3 mt-1 flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-primary shadow-glow-primary hover:opacity-90 transition-opacity"
            >
              Back to LoPiPo
            </Link>
            <Link
              href="/privacy"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold text-primary border border-primary/30 hover:bg-primary/5 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
