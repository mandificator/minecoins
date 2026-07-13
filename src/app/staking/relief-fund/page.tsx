import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import StakePanel from "@/components/web3/StakePanel";
import { NeonLink } from "@/components/ui/NeonButton";
import TerminalCard from "@/components/ui/TerminalCard";
import { RELIEF_RELEASE_PCT, RELIEF_MIN_STAKE_DAYS } from "@/lib/solana/config";

export const metadata: Metadata = {
  title: "Relief Fund",
  description: "Stake $PROM, earn a daily share of the decay the battery collects.",
};

export default function ReliefFundPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="mb-10 text-xs text-fg-dim">
        <Link href="/staking" className="hover:text-title hover:underline">
          Investment
        </Link>
        <span className="mx-2">/</span>
        <span className="text-fg">Relief Fund</span>
      </div>

      <div className="flex justify-center">
        <Image
          src="/img/docs/relief-fund.png"
          alt="Relief Fund"
          width={314}
          height={280}
          priority
          className="mb-10 h-auto w-1/3"
        />
      </div>
      <TerminalCard title="WHAT IT IS">
        <p className="leading-relaxed">
          Stake <span className="text-fg">$PROM</span> and earn{" "}
          <span className="text-fg">interest, paid in $PROM</span> — stable, on
          Solana, no decay. Each day the battery releases{" "}
          <span className="text-fg">{RELIEF_RELEASE_PCT}%</span> of its balance
          to stakers, split by your share. Your yield is powered by everyone
          else&apos;s delay.
        </p>
      </TerminalCard>

      <div className="mt-16 grid gap-12 md:grid-cols-2 md:items-start">
        <StakePanel pool="relief" />

        <div className="space-y-8 text-sm leading-relaxed">
          <div>
            <h2 className="dash-label mb-3">Where the interest comes from</h2>
            <p className="text-fg-dim">
              Every miner who stabilizes late loses a slice to decay, and that
              slice settles into the battery via the Stabilization Plant. The
              battery pays it back out to stakers as interest.
            </p>
          </div>

          <div>
            <h2 className="dash-label mb-3">How it works</h2>
            <ol className="list-decimal space-y-2 pl-5 text-fg-dim">
              <li>
                Stake <span className="text-fg">$PROM</span> into the Relief
                Fund on Solana (a {RELIEF_MIN_STAKE_DAYS}-day minimum lock).
              </li>
              <li>
                Each day the battery releases{" "}
                <span className="text-fg">{RELIEF_RELEASE_PCT}%</span> of its
                balance to stakers.
              </li>
              <li>
                Your share is <span className="text-fg">time-weighted</span> —
                by how much you stake <em>and</em> how long you hold it: your
                (stake × time) ÷ everyone&apos;s (stake × time). You earn from
                the moment you stake, only for the time you stay in.
              </li>
              <li>
                Paid in <span className="text-title">$PROM</span>, no decay,
                yours to keep. Principal is locked {RELIEF_MIN_STAKE_DAYS} days;
                yield is not.
              </li>
            </ol>
          </div>

          <div>
            <h2 className="dash-label mb-3">Good to know</h2>
            <ul className="space-y-2 text-fg-dim">
              <li>Separate pool from the R&amp;D Institute — you can be in both.</li>
              <li>
                {RELIEF_MIN_STAKE_DAYS}-day minimum lock; yield is paid{" "}
                <span className="text-fg">automatically, daily</span> — no claim
                step.
              </li>
              <li>
                Yield scales with the battery&apos;s intake — busier network,
                more decay collected, more interest.
              </li>
              <li>
                Staking / unstaking each cost 1 USDC via x402 — the fee goes to
                the <span className="text-fg">battery</span>, growing the fund
                everyone earns from.
              </li>
            </ul>
          </div>

          <NeonLink href="/docs/relief-fund" color="cyan">
            READ THE DOCS →
          </NeonLink>
        </div>
      </div>

      <div className="mt-20 flex items-center justify-between border-t border-border pt-6 text-sm">
        <Link
          href="/staking/rd-institute"
          className="glitch-hover text-fg-dim hover:text-title"
        >
          ◂ R&amp;D Institute
        </Link>
        <Link href="/staking" className="glitch-hover text-right text-fg-dim hover:text-title">
          Investment ▸
        </Link>
      </div>
    </div>
  );
}
