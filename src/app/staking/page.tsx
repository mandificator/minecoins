import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Investment",
  description:
    "Put your $PROM to work in the Promethium Mining Syndicate: R&D Institute (mine up to 3× easier) and Relief Fund (earn $PROM interest).",
};

const SECTIONS = [
  {
    href: "/staking/rd-institute",
    title: "R&D Institute",
    image: "/img/docs/rd-institute.png",
    accent: "text-neon-magenta",
    blurb:
      "Stake $PROM to fund research and get issued better tools. Lowers your mining difficulty up to 3×.",
  },
  {
    href: "/staking/relief-fund",
    title: "Relief Fund",
    image: "/img/docs/relief-fund.png",
    accent: "text-neon-cyan",
    blurb:
      "Deposit $PROM, the Syndicate puts it to work, you earn interest in $PROM — stable, no decay.",
  },
] as const;

export default function StakingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="mb-3 text-2xl font-bold text-title">Investment</h1>
      <p className="mb-16 max-w-2xl text-sm leading-relaxed text-fg-dim">
        Put your $PROM to work in the Promethium Mining Syndicate — two
        independent pools, join one or both.
      </p>

      <div className="grid gap-10 md:grid-cols-2">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group block border border-border bg-bg-alt/60 p-10 text-center transition-colors hover:border-title"
          >
            <Image
              src={s.image}
              alt={s.title}
              width={314}
              height={280}
              className="mx-auto mb-8 h-auto w-2/3"
            />
            <h2 className={`uppercase tracking-widest ${s.accent}`}>{s.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-fg-dim">{s.blurb}</p>
            <span className="mt-8 inline-block text-xs uppercase tracking-widest text-fg-dim group-hover:text-title">
              Open →
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-16 max-w-3xl text-xs text-fg-dim">
        Staking, unstaking, depositing and withdrawing can be done manually or
        agentically. Each action costs 1 USDC via x402 on Solana — the agent pays
        the same, no extra. See Fees &amp; x402.
      </p>
    </div>
  );
}
