import type { Metadata } from "next";
import TerminalCard from "@/components/ui/TerminalCard";
import { NeonLink } from "@/components/ui/NeonButton";

export const metadata: Metadata = {
  title: "Agentic Mining",
  description: "The Agentic Mining Company runs on intent, not dashboards.",
};

const SKILLS = [
  {
    name: "promethium-mining",
    desc: "Sets up and runs a CPU miner: fetches the tools, generates an address you control, optionally claims the Solana staking/referral discount, and keeps mining unattended.",
    href: "/downloads/skill.md",
  },
  {
    name: "promethium-explorer",
    desc: "Reads the chain for free — height, difficulty, a block, a transaction, or an address (balance + which blocks it mined). Read-only, no key needed, safe to call as often as you like.",
    href: "/downloads/explorer-skill.md",
  },
  {
    name: "promethium-pool",
    desc: "Points a miner at the shared pool instead of solo — 0% fee, PPLNS payout straight to your own address. Steadier, lower-variance income for smaller rigs.",
    href: "/downloads/pool-skill.md",
  },
  {
    name: "promethium-node",
    desc: "Installs, builds, and runs a full Promethium node — independently validates the chain, sends/receives PROM, and applies the staking discount automatically.",
    href: "/downloads/node-skill.md",
  },
  {
    name: "promethium-bridge",
    desc: "Stabilizes surfaced PROM before it decays — bridges it to $PROM SPL on Solana. Sends the deposit with an OP_RETURN, pays the 1 USDC fee (x402 or wallet), and receives the healthy portion; the decayed part funds the Relief battery. Decay freezes the moment the deposit confirms.",
    href: "/downloads/bridge-skill.md",
  },
  {
    name: "promethium-battery",
    desc: "Stakes $PROM into the Relief Fund battery (30-day minimum) for daily yield, and claims or unstakes on request. Automates the 1 USDC per-action fee.",
    href: "/downloads/battery-stake-skill.md",
  },
];

export default function AgenticMiningPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="dash-title font-bold text-title">AGENTIC MINING</h1>
      <p className="mt-3 max-w-2xl text-fg-dim">
        The Agentic Mining Company runs on intent, not dashboards.
      </p>

      <section className="py-8">
        <TerminalCard title="WHAT IT IS">
          <p className="leading-relaxed">
            Drop a skill file into an agent like Claude and it runs part of the
            company over the command line for you — mine, watch the chain, pool,
            or run a node. You state intent; the agent executes. Tell it{" "}
            <em>&quot;set me up mining, and stabilize anything that surfaces&quot;</em>{" "}
            and it does the rest — paying its own way over{" "}
            <NeonLink href="/docs/fees-x402">x402</NeonLink>.
          </p>
        </TerminalCard>
      </section>

      <section className="pb-8">
        <TerminalCard title="YOU SET THE RULES">
          <p className="leading-relaxed">
            You decide how the agent behaves: what it does with the $PROM it
            stabilizes (hold, stake in R&amp;D, deposit into the Relief Fund), and
            when it acts at all.
          </p>
          <p className="mt-3 leading-relaxed text-fg-dim">
            It can run on a recurring schedule or only when you tell it to.
            Promethium decays on a 17.7h half-life from the moment it surfaces —
            set it to watch closely and it stabilizes while you sleep, so you keep
            more. Checking the chain is free via the explorer skill, so there&apos;s
            no cost to watching often.
          </p>
          <p className="mt-3 leading-relaxed text-fg-dim">
            For mining itself, you set the terms: which hours to mine in (round the
            clock, or only overnight), and how much of the machine&apos;s power to
            give it — full throttle, or capped so it shares the box with other
            work.
          </p>
        </TerminalCard>
      </section>

      <section className="pb-8">
        <h2 className="dash-label mb-5">// published skills</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {SKILLS.map((skill) => (
            <TerminalCard key={skill.name} title={skill.name}>
              <p className="leading-relaxed text-fg-dim">{skill.desc}</p>
              <div className="mt-4">
                <NeonLink href={skill.href}>DOWNLOAD</NeonLink>
              </div>
            </TerminalCard>
          ))}
        </div>
      </section>

      <section className="pb-12">
        <TerminalCard title="FEES">
          <p className="leading-relaxed">
            The agent pays the same <span className="text-title">1 USDC</span>{" "}
            <span className="text-title">x402</span> fees on stabilizing, staking
            and unstaking as you would doing it by hand — nothing extra. Checking
            the chain is free.
          </p>
          <p className="mt-3 leading-relaxed text-fg-dim">
            x402 lets the agent pay and act with no checkout and no accounts. You
            fund the agent&apos;s wallet — we recommend keeping at least 10 USDC in
            it. See <NeonLink href="/docs/fees-x402">Fees &amp; x402</NeonLink>.
          </p>
        </TerminalCard>
      </section>

      <div className="flex flex-wrap gap-3">
        <NeonLink href="/docs/get-started">START MINING</NeonLink>
        <NeonLink href="/docs">BROWSE THE DOCS</NeonLink>
      </div>
    </div>
  );
}
