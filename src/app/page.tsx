import ScrollReveal from "@/components/effects/ScrollReveal";
import TypedPrompt from "@/components/ui/TypedPrompt";
import TerminalCard from "@/components/ui/TerminalCard";
import Mermaid from "@/components/docs/Mermaid";
import { NeonLink } from "@/components/ui/NeonButton";

// Periodic-table tile for the element (Pm, Z=61, mass ~[145]) as a Mermaid node.
const ELEMENT = `graph TB
  PM["61<br/><br/>Pm<br/><br/>Promethium<br/>[145]"]`;

const LOOP_DIAGRAM = `graph LR
  DEEP -->|mine| SURFACE
  SURFACE -->|bridge in time| PROM["$PROM (stable, Solana)"]
  SURFACE -->|too slow, decays| BATTERY["THE BATTERY"]
  BATTERY -->|paid out| STAKERS["battery stakers"]`;

const DECAY_DIAGRAM = `graph LR
  S[surfaced] -->|17.7h| A["½ left"]
  A -->|17.7h| B["¼ left"]
  B -->|17.7h| C["⅛ left"]
  C --> G["… gone"]`;

const NAMES = [
  ["PROMETHIUM", "the coin you mine on Promethium Chain"],
  ["$PROM", "the same value, stabilized as a token on Solana"],
  ["The Battery", "where decayed promethium goes — redistributed to stakers"],
];

const LOOP = [
  ["Mine deep", "real Proof-of-Work pulls promethium out of Promethium Chain"],
  ["Haul it up", "100 blocks to the surface — safe, nothing decays yet"],
  ["The clock starts", "at the surface, the 17.7h half-life begins"],
  ["Bridge to survive", "cross to Solana and it freezes solid as $PROM"],
  ["Or lose it to the Battery", "what you let decay drains to the Battery and pays stakers"],
];

const POOLS = [
  {
    title: "Difficulty Pool",
    body: "Stake $PROM and the oracle lowers your mining difficulty — up to 3× easier. For active miners.",
  },
  {
    title: "Battery Pool",
    body: "Stake $PROM and draw from the Battery — the promethium others let decay — as PROMETHIUM yield. For passive earners.",
  },
];

const PARAMS = [
  "SHA-256",
  "~10 min block",
  "100-block haul",
  "17.7h half-life",
  "21,000,000 cap",
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden border-b border-border py-16 md:py-24">
        <div className="flex flex-col items-center text-center">
          <div className="w-full max-w-xs">
            <Mermaid code={ELEMENT} />
          </div>
          <h1 className="mt-8 tracking-[0.2em] text-title">PROMETHIUM</h1>
          <p className="mt-4 max-w-2xl text-title">
            An element that doesn&apos;t want to exist — so you have to take it
            by force.
          </p>
          <p className="mt-2 max-w-2xl text-fg-dim">
            Mine it with real Proof-of-Work. It surfaces unstable and starts to
            decay — bridge it to Solana as $PROM before it fades, or it drains
            into the Battery and pays out to stakers.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <NeonLink href="/docs">READ THE DOCS</NeonLink>
            <NeonLink href="/docs/get-started">START MINING</NeonLink>
          </div>

          <div className="mt-8 w-full max-w-xl border border-border bg-bg-alt/70 px-4 py-3 text-left">
            <TypedPrompt text="prom status --surfaced --decay-timer" />
          </div>
        </div>
      </section>

      {/* ---------------- THE STORY ---------------- */}
      <section className="py-12">
        <TerminalCard title="THE STORY">
          <p className="leading-relaxed">
            In the real world, promethium is the rarest of the rare earths.
            Every atom of it is radioactive. There are no promethium mines — the
            only promethium that exists is the promethium <em>someone made</em>.
          </p>
          <p className="mt-4 leading-relaxed">
            We built a coin on exactly that. You mine PROMETHIUM the honest way,
            but it comes out deep, unstable, and impatient. The moment it hits
            the surface it starts to vanish. Your job: get it somewhere safe
            before it fades.
          </p>
        </TerminalCard>
      </section>

      {/* ---------------- THREE NAMES ---------------- */}
      <section className="py-6">
        <h2 className="mb-5 uppercase tracking-[0.3em] text-fg-dim">
          // the three names you need
        </h2>
        <div className="overflow-x-auto border border-border">
          <table className="w-full">
            <tbody>
              {NAMES.map(([name, desc]) => (
                <tr key={name} className="border-b border-border/60 last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-title">
                    {name}
                  </td>
                  <td className="px-4 py-3 text-fg-dim">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------- THE LOOP ---------------- */}
      <section className="py-12">
        <h2 className="mb-5 uppercase tracking-[0.3em] text-fg-dim">
          // the loop
        </h2>
        <ScrollReveal>
          <div className="mb-6">
            <Mermaid code={LOOP_DIAGRAM} />
          </div>
        </ScrollReveal>
        <ol className="space-y-3">
          {LOOP.map(([step, detail], i) => (
            <li
              key={step}
              className="flex gap-4 border border-border bg-bg-alt/40 px-4 py-3"
            >
              <span className="text-title">{String(i + 1).padStart(2, "0")}</span>
              <span>
                <span className="text-title">{step}</span>
                <span className="text-fg-dim"> — {detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------- DECAY ---------------- */}
      <section className="py-6">
        <h2 className="mb-5 uppercase tracking-[0.3em] text-fg-dim">
          // the decay — 17.7h half-life
        </h2>
        <TerminalCard title="SURFACE = THE CLOCK">
          <p className="leading-relaxed">
            For the first <span className="text-title">100 blocks</span> (the
            haul) your promethium is safe — nothing decays. The instant it
            surfaces, the clock starts: a half-life of{" "}
            <span className="text-title">17.7 hours</span>. It&apos;s a slope,
            not a cliff — every hour you wait costs you half again.
          </p>
          <div className="mt-4">
            <Mermaid code={DECAY_DIAGRAM} />
          </div>
        </TerminalCard>
      </section>

      {/* ---------------- THE BATTERY + POOLS ---------------- */}
      <section className="py-6">
        <h2 className="mb-5 uppercase tracking-[0.3em] text-fg-dim">
          // the battery &amp; two pools
        </h2>
        <TerminalCard title="THE BATTERY" className="mb-4">
          <p className="leading-relaxed">
            Decayed promethium isn&apos;t destroyed — it drains into the{" "}
            <span className="text-title">Battery</span>, an on-chain reservoir,
            and is paid back out as fresh PROMETHIUM to people who stake. Supply
            is conserved; it just changes hands from the slow to the diligent.
          </p>
        </TerminalCard>
        <div className="grid gap-4 md:grid-cols-2">
          {POOLS.map((p) => (
            <TerminalCard key={p.title} title={p.title}>
              <p className="text-fg">{p.body}</p>
            </TerminalCard>
          ))}
        </div>
      </section>

      {/* ---------------- THE ONE RULE ---------------- */}
      <section className="py-12">
        <TerminalCard title="THE ONE RULE">
          <p className="leading-relaxed text-title">
            Mine deep. Surface. Bridge before it fades.
          </p>
          <p className="mt-1 leading-relaxed text-fg-dim">
            Promethium rewards the quick and quietly redistributes from the slow.
          </p>
          <blockquote className="mt-4 border-l-2 border-title pl-4 text-fg-dim">
            Agentic mining: drive the whole loop — mine, bridge, stake — from the
            command line through Claude, via one <code>skill.md</code>. State
            your intent; the agent races the clock for you.
          </blockquote>
        </TerminalCard>
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
          <NeonLink href="/docs/get-started">GET STARTED</NeonLink>
          <NeonLink href="/docs">BROWSE THE DOCS</NeonLink>
        </div>
      </section>
    </div>
  );
}
