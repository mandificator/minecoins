import type { Metadata } from "next";
import StakePanel from "@/components/web3/StakePanel";

export const metadata: Metadata = {
  title: "Staking — Promethium",
  description:
    "Stake $PROM on Solana in two pools: Difficulty (mine up to 3× easier) and Battery (earn PROMETHIUM yield from decay).",
};

export default function StakingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-neon-magenta">
        Staking — Two Pools
      </h1>
      <p className="mb-8 max-w-2xl text-sm text-fg-dim">
        Stake your $PROM on Solana in either pool, or both at once. The oracle
        reads your stakes and tells Promethium Chain what to apply.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <StakePanel />

        <div className="space-y-5 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg text-neon-cyan">🪨 Difficulty Pool</h2>
            <p className="text-fg-dim">
              Stake $PROM and the oracle lowers your personal mining difficulty
              — up to <span className="neon-magenta">3×</span> easier. More stake
              → easier mining, capped at 3× for everyone. Your discount is
              personal and doesn&apos;t change anyone else&apos;s mining.
            </p>
          </div>
          <div>
            <h2 className="text-lg text-neon-cyan">🔋 Battery Pool</h2>
            <p className="text-fg-dim">
              Stake $PROM and draw from the Battery — the promethium that decayed
              because other miners were too slow to bridge. Payouts are
              proportional to your stake, handed out as fresh{" "}
              <span className="text-fg">PROMETHIUM</span>. That yield surfaces and
              starts its own 17.7h decay, so bridge it if you want to keep it.
            </p>
          </div>
          <ul className="space-y-1 pl-5 text-fg-dim">
            <li className="list-disc">
              Staking uses $PROM — bridge your mined promethium first.
            </li>
            <li className="list-disc">
              Use either pool or both; staking is always optional.
            </li>
            <li className="list-disc">
              Each stake / unstake costs 1 USDC via x402 on Solana.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
