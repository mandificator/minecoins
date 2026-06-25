import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import StakePanel from "@/components/web3/StakePanel";
import { NeonLink } from "@/components/ui/NeonButton";
import TerminalCard from "@/components/ui/TerminalCard";

export const metadata: Metadata = {
  title: "R&D Institute",
  description:
    "Stake $PROM to fund research and get better tools — mine up to 3× easier.",
};

export default function RdInstitutePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="mb-10 text-xs text-fg-dim">
        <Link href="/staking" className="hover:text-title hover:underline">
          Investment
        </Link>
        <span className="mx-2">/</span>
        <span className="text-fg">R&amp;D Institute</span>
      </div>

      <div className="flex flex-col items-center">
        <Image
          src="/img/docs/rd-institute.png"
          alt="R&D Institute"
          width={314}
          height={280}
          priority
          className="mb-10 h-auto w-1/3"
        />
        <TerminalCard title="WHAT IT IS" accent="magenta" className="w-full max-w-xl">
          <p className="leading-relaxed">
            Stake <span className="text-fg">$PROM</span> to fund the
            Syndicate&apos;s research. In return, you&apos;re issued better
            tools — lowering your personal mining difficulty by up to{" "}
            <span className="text-title">3×</span>.
          </p>
        </TerminalCard>
      </div>

      <div className="mt-16 grid gap-12 md:grid-cols-2 md:items-start">
        <StakePanel pool="difficulty" />

        <div className="space-y-8 text-sm leading-relaxed">
          <div>
            <h2 className="mb-3 uppercase tracking-widest text-fg-dim">
              How it works
            </h2>
            <ol className="list-decimal space-y-2 pl-5 text-fg-dim">
              <li>
                Stake <span className="text-fg">$PROM</span> into the R&amp;D
                Institute on Solana.
              </li>
              <li>The oracle reads your stake and reports it to Promethium Chain.</li>
              <li>
                Your mining difficulty drops, scaled to your stake, capped at{" "}
                <span className="text-title">3× easier</span>.
              </li>
              <li>While your stake stays in, your tools stay sharp.</li>
            </ol>
          </div>

          <div>
            <h2 className="mb-3 uppercase tracking-widest text-fg-dim">
              Good to know
            </h2>
            <ul className="space-y-2 text-fg-dim">
              <li>It&apos;s personal — your discount doesn&apos;t change anyone else&apos;s.</li>
              <li>Stacks with the Recruitment Office labour bonus (up to 2×).</li>
              <li>Optional — you can always mine at full difficulty with no stake.</li>
              <li>Stake / unstake each cost 1 USDC via x402.</li>
            </ul>
          </div>

          <NeonLink href="/docs/rd-institute" color="cyan">
            READ THE DOCS →
          </NeonLink>
        </div>
      </div>

      <div className="mt-20 flex items-center justify-between border-t border-border pt-6 text-sm">
        <Link href="/staking" className="glitch-hover text-fg-dim hover:text-title">
          ◂ Investment
        </Link>
        <Link
          href="/staking/relief-fund"
          className="glitch-hover text-right text-fg-dim hover:text-title"
        >
          Relief Fund ▸
        </Link>
      </div>
    </div>
  );
}
