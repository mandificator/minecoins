import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import StakePanel from "@/components/web3/StakePanel";
import { NeonLink } from "@/components/ui/NeonButton";
import TerminalCard from "@/components/ui/TerminalCard";

export const metadata: Metadata = {
  title: "Relief Fund",
  description: "Deposit $PROM, the Syndicate puts it to work, you earn interest in $PROM.",
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

      <div className="flex flex-col items-center">
        <Image
          src="/img/docs/relief-fund.png"
          alt="Relief Fund"
          width={314}
          height={280}
          priority
          className="mb-10 h-auto w-1/3"
        />
        <TerminalCard title="WHAT IT IS" accent="cyan" className="w-full max-w-xl">
          <p className="leading-relaxed">
            Deposit <span className="text-fg">$PROM</span> and earn{" "}
            <span className="text-fg">interest, paid in $PROM</span> — stable,
            on Solana, no decay. Your yield is powered by everyone else&apos;s
            delay.
          </p>
        </TerminalCard>
      </div>

      <div className="mt-16 grid gap-12 md:grid-cols-2 md:items-start">
        <StakePanel pool="relief" />

        <div className="space-y-8 text-sm leading-relaxed">
          <div>
            <h2 className="mb-3 uppercase tracking-widest text-fg-dim">
              Where the interest comes from
            </h2>
            <p className="text-fg-dim">
              Every miner who stabilizes late loses a slice to decay, and that
              slice settles into the Fund via the Stabilization Plant. The Fund
              pays it back out to depositors as interest.
            </p>
          </div>

          <div>
            <h2 className="mb-3 uppercase tracking-widest text-fg-dim">
              How it works
            </h2>
            <ol className="list-decimal space-y-2 pl-5 text-fg-dim">
              <li>
                Deposit <span className="text-fg">$PROM</span> into the Relief
                Fund on Solana.
              </li>
              <li>Your share of payouts is proportional to your deposit.</li>
              <li>
                Interest accrues in <span className="text-title">$PROM</span> —
                stable, no decay, yours to keep.
              </li>
            </ol>
          </div>

          <div>
            <h2 className="mb-3 uppercase tracking-widest text-fg-dim">
              Good to know
            </h2>
            <ul className="space-y-2 text-fg-dim">
              <li>This is a separate pool from the R&amp;D Institute — you can be in both.</li>
              <li>Yield scales with the Fund&apos;s intake — busier network, more interest.</li>
              <li>Deposit / withdraw each cost 1 USDC via x402.</li>
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
