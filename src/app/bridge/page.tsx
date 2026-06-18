import type { Metadata } from "next";
import BridgePanel from "@/components/web3/BridgePanel";

export const metadata: Metadata = {
  title: "The Stabilization Plant — Promethium",
  description: "Decant surfaced PROMETHIUM into stable $PROM on Solana. Agentic by design.",
};

export default function BridgePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-neon-cyan">
        The Stabilization Plant
      </h1>
      <p className="mb-6 max-w-2xl text-sm text-fg-dim">
        Decant surfaced PROMETHIUM into stable $PROM.
      </p>

      <blockquote className="mb-8 border-l-2 border-neon-cyan pl-4 text-sm leading-relaxed text-fg-dim">
        You send <span className="text-fg">X PROMETHIUM</span> and receive{" "}
        <span className="text-fg">Y $PROM</span>, where{" "}
        <span className="text-fg">X = Y + decayed</span>. The decayed amount is the
        slice lost to the 17.7h half-life while it sat at the surface — it&apos;s
        routed to the <span className="text-fg">Relief Fund</span> as $PROM and
        paid to depositors. Stabilize fast, keep more.
      </blockquote>

      {/* Agentic-first — the emphasis of this page, full width */}
      <div className="mb-8 w-full border border-neon-magenta/60 bg-bg-alt/60 p-5 text-sm">
        <h2 className="mb-2 uppercase tracking-widest text-neon-magenta">
          Agentic bridge — the way to do it
        </h2>
        <p className="mb-3 text-fg-dim">
          This is agentic by design. The agent watches for surfacing and
          stabilizes instantly — beating the 17.7h clock while you sleep. One
          endpoint:
        </p>
        <pre className="overflow-x-auto border border-border bg-bg p-3 font-mono text-xs text-neon-green">
{`POST /v1/stabilize
{ "promethium_txid": "<surfaced tx>", "solana_address": "<dest>" }
-> settles 1 USDC via x402; returns $PROM transfer + decayed slice -> Relief Fund`}
        </pre>
      </div>

      <BridgePanel />
    </div>
  );
}
