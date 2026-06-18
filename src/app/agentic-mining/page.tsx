import type { Metadata } from "next";
import TerminalCard from "@/components/ui/TerminalCard";
import { NeonLink } from "@/components/ui/NeonButton";

export const metadata: Metadata = {
  title: "Agentic Mining",
  description: "The Agentic Mining Company runs on intent, not dashboards.",
};

const COMMANDS = [
  ["prom status", "see what's mined, surfaced, and decaying right now"],
  ["prom stabilize --on-surface", "decant promethium to $PROM the instant it surfaces"],
  ["prom stake rd --amount 500", "fund the R&D Institute for easier mining"],
  ["prom recruit --link", "open the Recruitment Office and bring miners under you"],
  ["prom deposit relief --amount 200", "put $PROM in the Relief Fund to earn interest"],
];

export default function AgenticMiningPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="tracking-[0.2em] text-title">AGENTIC MINING</h1>
      <p className="mt-3 max-w-2xl text-fg-dim">
        The Agentic Mining Company runs on intent, not dashboards.
      </p>

      <section className="py-8">
        <TerminalCard title="WHAT IT IS">
          <p className="leading-relaxed">
            A <code>skill.md</code> teaches an agent like Claude how to run the
            whole company over the command line — mine, stabilize, stake, recruit.
            You state intent; the agent executes. Tell it{" "}
            <em>&quot;stabilize what surfaced, stake half in R&amp;D&quot;</em> and
            it does the rest.
          </p>
        </TerminalCard>
      </section>

      <section className="pb-8">
        <TerminalCard title="YOU SET THE RULES">
          <p className="leading-relaxed">
            You decide how the agent behaves: how often it checks the chain (every
            few minutes, hourly, daily), what it does with the $PROM it stabilizes
            (hold, stake in R&amp;D, deposit into the Relief Fund), and when it
            acts at all.
          </p>
          <p className="mt-3 leading-relaxed text-fg-dim">
            It can run on a recurring schedule or only when you tell it to. Promethium
            decays on a 17.7h half-life from the moment it surfaces — set it to watch
            closely and it stabilizes while you sleep, so you keep more.
          </p>
        </TerminalCard>
      </section>

      <section className="pb-8">
        <h2 className="mb-5 uppercase tracking-[0.3em] text-fg-dim">
          // example commands
        </h2>
        <div className="overflow-x-auto border border-border">
          <table className="w-full">
            <tbody>
              {COMMANDS.map(([cmd, desc]) => (
                <tr key={cmd} className="border-b border-border/60 last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-neon-green">
                    {cmd}
                  </td>
                  <td className="px-4 py-3 text-fg-dim">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-fg-dim">Commands are illustrative.</p>
      </section>

      <section className="pb-12">
        <TerminalCard title="FEES">
          <p className="leading-relaxed">
            The agent pays the same <span className="text-title">1 USDC</span> x402
            fees on stabilizing, staking and unstaking as you would doing it by
            hand — nothing extra.
          </p>
          <p className="mt-3 leading-relaxed text-fg-dim">
            The one difference: it pays <span className="text-title">10¢</span> each
            time it checks the chain on your behalf to see whether you&apos;ve mined
            promethium that needs stabilizing. You fund the agent&apos;s wallet — we
            recommend keeping at least 10 USDC in it. See{" "}
            <NeonLink href="/docs/fees-x402">Fees &amp; x402</NeonLink>.
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
