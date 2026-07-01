import type { Metadata } from "next";
import TerminalCard from "@/components/ui/TerminalCard";
import { NeonLink } from "@/components/ui/NeonButton";
import { faucetClientSettings, faucetConfig } from "@/lib/faucet/config";
import ClaimFlow from "./ClaimFlow";

export const metadata: Metadata = {
  title: "Faucet",
  description:
    "Community faucet for $PROM. Connect X, post about Promethium, drop your address and claim free PROM.",
  alternates: { canonical: "/faucet" },
};

const HOW: [string, string][] = [
  [
    "① Connect X",
    `Your account must be at least ${faucetConfig.minAccountAgeDays} days old and have ${faucetConfig.minFollowers}+ followers. We verify this automatically.`,
  ],
  [
    "② Post about $PROM",
    "We hand you the text and an image — one click to post. No writing required.",
  ],
  [
    "③ Drop your address",
    "Paste your Promethium address. New here? We link a guide that shows you how to make one.",
  ],
  [
    "④ Get PROM",
    `Criteria verified → your address is recorded and PROM is sent by the distribution team. ${faucetConfig.rewardRegular} PROM for regular accounts, ${faucetConfig.rewardVerified} PROM for verified.`,
  ],
];

const ELIGIBILITY = [
  `X account ≥ ${faucetConfig.minAccountAgeDays} days`,
  `≥ ${faucetConfig.minFollowers} followers`,
  "1 post about $PROM",
  `${faucetConfig.rewardRegular} PROM regular`,
  `${faucetConfig.rewardVerified} PROM verified`,
];

const FAQ: [string, string][] = [
  [
    "Why do you need my X account?",
    "To keep the faucet fair and bot-free. We only read your public profile (age, followers, verified status) to check eligibility — nothing is posted on your behalf.",
  ],
  [
    "How much PROM do I get?",
    `${faucetConfig.rewardRegular} PROM for a regular eligible account, ${faucetConfig.rewardVerified} PROM for a verified account.`,
  ],
  [
    "When does the PROM arrive?",
    "We collect and verify addresses here; payouts are sent in batches by the distribution team. Keep the wallet you submitted.",
  ],
];

export default function FaucetPage() {
  const settings = faucetClientSettings();

  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden border-b border-border py-16 md:py-24">
        <div className="flex flex-col items-center text-center">
          <h1 className="tracking-[0.2em] text-title">PROMETHIUM FAUCET</h1>
          <p className="mt-3 max-w-2xl text-title">Free $PROM for the community.</p>
          <p className="mt-4 max-w-2xl text-fg-dim">
            Post about the element that fights back, drop your address, and claim
            your coins.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            {[
              `${faucetConfig.rewardRegular} PROM · regular`,
              `${faucetConfig.rewardVerified} PROM · verified`,
            ].map((p, i, a) => (
              <span key={p} className="flex items-center gap-3">
                <span className="text-title">{p}</span>
                {i < a.length - 1 && <span className="text-fg-dim">·</span>}
              </span>
            ))}
          </div>
          <div className="mt-8">
            <NeonLink href="#claim">CLAIM YOUR PROM ↓</NeonLink>
          </div>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="py-12">
        <h2 className="mb-5 uppercase tracking-[0.3em] text-fg-dim">
          // how the faucet works
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {HOW.map(([title, body]) => (
            <TerminalCard key={title} title={title}>
              <p className="break-words text-fg">{body}</p>
            </TerminalCard>
          ))}
        </div>
      </section>

      {/* ---------------- ELIGIBILITY STRIP ---------------- */}
      <section className="py-6">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-y border-border py-5 text-center">
          {ELIGIBILITY.map((p, i, a) => (
            <span key={p} className="flex items-center gap-3">
              <span className="text-title">{p}</span>
              {i < a.length - 1 && <span className="text-fg-dim">·</span>}
            </span>
          ))}
        </div>
      </section>

      {/* ---------------- CLAIM APP ---------------- */}
      <section id="claim" className="scroll-mt-8 py-12">
        <h2 className="mb-5 uppercase tracking-[0.3em] text-fg-dim">
          // claim your prom
        </h2>
        <ClaimFlow settings={settings} />
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="py-12">
        <h2 className="mb-5 uppercase tracking-[0.3em] text-fg-dim">// faq</h2>
        <TerminalCard title="FAQ">
          <dl className="flex flex-col gap-4">
            {FAQ.map(([q, a]) => (
              <div key={q}>
                <dt className="break-words text-title">&gt; {q}</dt>
                <dd className="mt-1 break-words text-fg-dim">{a}</dd>
              </div>
            ))}
          </dl>
        </TerminalCard>
      </section>
    </div>
  );
}
