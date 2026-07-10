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
    "② Post in your own words",
    "Tag @promethium_work and share why you're bullish on the chain — your words, not a canned message. We open X pre-tagged; you add the rest.",
  ],
  [
    "③ Drop your address",
    "Paste your Promethium address (and a referral code if you have one). New here? We link a guide that shows you how to make one.",
  ],
  [
    "④ Get PROM",
    `Criteria verified → your address is recorded and paid automatically. ${faucetConfig.rewardRegular} PROM regular, ${faucetConfig.rewardVerified} PROM verified, +${faucetConfig.referredExtra} with a referral code.`,
  ],
];

const ELIGIBILITY = [
  `X account ≥ ${faucetConfig.minAccountAgeDays} days`,
  `≥ ${faucetConfig.minFollowers} followers`,
  "1 original post tagging @promethium_work",
  "1 claim per X account",
  `${faucetConfig.rewardRegular} regular · ${faucetConfig.rewardVerified} verified · +${faucetConfig.referrerBonus}/referral`,
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
    "Automatically — payouts run in batches roughly every half hour. Keep the wallet you submitted; that's where it lands.",
  ],
  [
    "How do referrals work?",
    `When you claim you get your own referral code. Share it: each friend who claims with it earns you +${faucetConfig.referrerBonus} PROM, and they get +${faucetConfig.referredExtra} on top of their reward. One claim per X account.`,
  ],
];

export default function FaucetPage() {
  const settings = faucetClientSettings();

  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden border-b border-border py-16 md:py-24">
        <div className="flex flex-col items-center text-center">
          <h1 className="dash-title font-bold text-title">PROMETHIUM FAUCET</h1>
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
        <h2 className="dash-label mb-5">// how the faucet works</h2>
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
        <h2 className="dash-label mb-5">// claim your prom</h2>
        <ClaimFlow settings={settings} />
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="py-12">
        <h2 className="dash-label mb-5">// faq</h2>
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
