import type { Metadata } from "next";
import StakePanel from "@/components/web3/StakePanel";

export const metadata: Metadata = {
  title: "Investment",
  description:
    "Put your $PROM to work in the Promethium Mining Syndicate: R&D Institute (mine up to 3× easier) and Relief Fund (earn $PROM interest).",
};

export default function StakingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-neon-magenta">Investment</h1>
      <p className="mb-8 max-w-2xl text-sm text-fg-dim">
        Put your $PROM to work in the Promethium Mining Syndicate.
      </p>

      {/* Two boxes side by side */}
      <div className="grid gap-6 md:grid-cols-2">
        <StakePanel pool="difficulty" />
        <StakePanel pool="battery" />
      </div>

      {/* Explanations under the boxes */}
      <div className="mt-8 grid gap-8 text-sm leading-relaxed md:grid-cols-2">
        <div>
          <h2 className="text-lg text-neon-cyan">🪨 R&amp;D Institute — difficulty</h2>
          <p className="text-fg-dim">
            Stake $PROM to fund research and get issued better tools. Lowers your
            mining difficulty up to <span className="neon-magenta">3×</span>. Your
            discount is personal and doesn&apos;t change anyone else&apos;s mining.
          </p>
        </div>
        <div>
          <h2 className="text-lg text-neon-cyan">🛟 Relief Fund — yield</h2>
          <p className="text-fg-dim">
            Deposit $PROM; the Syndicate puts it to work; you earn{" "}
            <span className="text-fg">interest in $PROM</span> — paid on Solana,
            stable, no decay.
          </p>
        </div>
      </div>

      <p className="mt-8 max-w-3xl text-xs text-fg-dim">
        Staking, unstaking, depositing and withdrawing can be done manually or
        agentically. Each action costs 1 USDC via x402 on Solana — the agent pays
        the same, no extra. See Fees &amp; x402.
      </p>
    </div>
  );
}
