import Image from "next/image";
import TypedPrompt from "@/components/ui/TypedPrompt";
import TerminalCard from "@/components/ui/TerminalCard";
import { NeonLink } from "@/components/ui/NeonButton";

const LIFECYCLE = [
  [
    "① Mine deep",
    "Real Proof-of-Work on Promethium Chain. CPU, GPU, ASIC — solo or pool. It takes 100 blocks to haul your promethium to the surface (safe — nothing decays yet).",
  ],
  [
    "② Race the decay",
    "It surfaces unstable and starts to decay — 17.7h half-life. Stabilize it to Solana as $PROM before too much fades. Stabilize on time and you keep ~100%; stabilize late and you keep what survived — the decayed slice settles into the Relief Fund.",
  ],
  [
    "③ Put $PROM to work",
    "Stake for better tools, recruit miners for more hands, or deposit for interest. The Syndicate rewards everything you bring.",
  ],
];

const SYNDICATE = [
  ["Stabilization Plant", "Decant surfaced PROMETHIUM into stable $PROM."],
  ["R&D Institute", "Stake $PROM → better tools → mine up to 3× easier."],
  ["Recruitment Office", "Recruit miners → more labour → up to 2× easier (stacks)."],
  ["Relief Fund", "Deposit $PROM → earn $PROM interest from captured decay."],
  ["Hiring Hall", "Pay a miner's wage; they dig for you. (coming soon)"],
];

const PARAMS = [
  "SHA-256",
  "~10 min block",
  "halving / 210,000 blocks",
  "21,000,000 MAX",
  "fair launch from block 1",
  "17.7h half-life",
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden border-b border-border py-16 md:py-24">
        <div className="flex flex-col items-center text-center">
          <div className="w-full max-w-xs">
            <Image
              src="/img/promethium-logo.png"
              alt="Promethium — Pm, element 61, [145]"
              width={500}
              height={500}
              priority
              className="h-auto w-full border-4 border-white"
            />
          </div>
          <h1 className="mt-8 tracking-[0.2em] text-title">
            AGENTIC MINING COMPANY
          </h1>
          <p className="mt-3 max-w-2xl text-title">
            Real Proof-of-Work tokens on Solana.
          </p>
          <p className="mt-4 max-w-2xl text-fg-dim">
            Mine an element that refuses to exist. Stabilize it before it fades.
            Let an agent run your mining for you.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <NeonLink href="/docs/get-started">START MINING</NeonLink>
            <NeonLink href="/agentic-mining">AGENTIC MINING →</NeonLink>
          </div>

          <div className="mt-8 w-full max-w-xl border border-border bg-bg-alt/70 px-4 py-3 text-left">
            <TypedPrompt text="prom mine --algo sha256 | prom stabilize --on-surface" />
          </div>
        </div>
      </section>

      {/* ---------------- IN ONE LINE ---------------- */}
      <section className="py-12">
        <TerminalCard title="IN ONE LINE">
          <p className="leading-relaxed">
            Promethium is mined deep on its own chain, surfaces unstable, and
            decays fast. Stabilize it onto Solana as{" "}
            <span className="text-title">$PROM</span> before too much fades — and
            have an <span className="text-title">agent</span> do it the instant it
            surfaces.
          </p>
        </TerminalCard>
      </section>

      {/* ---------------- THE PROMETHIUM LIFECYCLE ---------------- */}
      <section className="py-6">
        <h2 className="mb-5 uppercase tracking-[0.3em] text-fg-dim">
          // the promethium lifecycle
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {LIFECYCLE.map(([title, body]) => (
            <TerminalCard key={title} title={title}>
              <p className="text-fg">{body}</p>
            </TerminalCard>
          ))}
        </div>
      </section>

      {/* ---------------- AGENTIC MINING BANNER ---------------- */}
      <section className="py-12">
        <TerminalCard title="AGENTIC MINING">
          <p className="leading-relaxed text-title">
            You don&apos;t click dashboards. You give intent.
          </p>
          <p className="mt-2 leading-relaxed text-fg-dim">
            Tell an agent like Claude{" "}
            <em>&quot;stabilize what surfaced, stake half in R&amp;D&quot;</em> —
            it runs your whole mining operation over the command line via one{" "}
            <code>skill.md</code>, and beats the 17.7h clock while you sleep. Same
            x402 fees as doing it by hand. No extra cost.
          </p>
          <p className="mt-3 leading-relaxed text-fg-dim">
            The Company is us — the creators of the chain. Your agent looks after
            one miner: you.
          </p>
          <div className="mt-5">
            <NeonLink href="/agentic-mining">SEE AGENTIC MINING →</NeonLink>
          </div>
        </TerminalCard>
      </section>

      {/* ---------------- THE SYNDICATE ---------------- */}
      <section className="py-6">
        <h2 className="mb-5 uppercase tracking-[0.3em] text-fg-dim">
          // the syndicate — promethium mining syndicate
        </h2>
        <div className="overflow-x-auto border border-border">
          <table className="w-full">
            <tbody>
              {SYNDICATE.map(([dept, desc]) => (
                <tr key={dept} className="border-b border-border/60 last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-title">
                    {dept}
                  </td>
                  <td className="px-4 py-3 text-fg-dim">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------- KEY PARAMETERS ---------------- */}
      <section className="py-6">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-y border-border py-5 text-center">
          {PARAMS.map((p, i) => (
            <span key={p} className="flex items-center gap-3">
              <span className="text-title">{p}</span>
              {i < PARAMS.length - 1 && <span className="text-fg-dim">·</span>}
            </span>
          ))}
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="pb-16 pt-8 text-center">
        <p className="mb-5 text-title">
          Ready to mine the element that fights back?
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <NeonLink href="/docs/get-started">START MINING</NeonLink>
          <NeonLink href="/agentic-mining">AGENTIC MINING →</NeonLink>
        </div>
      </section>
    </div>
  );
}
