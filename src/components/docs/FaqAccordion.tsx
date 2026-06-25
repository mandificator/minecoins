"use client";

import { useState, type ReactNode } from "react";

type Item = { q: string; a: ReactNode };

const B = ({ children }: { children: ReactNode }) => (
  <span className="font-bold text-title">{children}</span>
);

const FAQ_ITEMS: Item[] = [
  {
    q: "What is this?",
    a: (
      <>
        The <B>Agentic Mining Company</B>: real Proof-of-Work tokens on Solana.
        You mine <B>PROMETHIUM</B> on Promethium Chain, stabilize it into{" "}
        <B>$PROM</B> on Solana, and run the whole thing through agents.
      </>
    ),
  },
  {
    q: "Is it a real coin or a token?",
    a: (
      <>
        Both. PROMETHIUM is a real PoW coin on its own chain. $PROM is the same
        value mirrored on Solana, 1:1, backed by mined coins.
      </>
    ),
  },
  {
    q: "Why does my promethium decay?",
    a: (
      <>
        It&apos;s unstable. Once it surfaces (after the 100-block haul), it has
        a <B>17.7h half-life</B>. The faster you stabilize, the more you keep as
        $PROM.
      </>
    ),
  },
  {
    q: "Do I lose everything if I'm slow?",
    a: (
      <>
        No. You always stabilize, and the Stabilization Plant keeps what
        survived as <B>$PROM</B> — only the decayed slice goes to the{" "}
        <B>Relief Fund</B>. Slow = smaller slice kept, never zero.
      </>
    ),
  },
  {
    q: "What happens to the decayed slice?",
    a: (
      <>
        It settles into the <B>Relief Fund</B> and is paid out to depositors as{" "}
        <B>$PROM interest</B>. Your delay becomes someone&apos;s yield.
      </>
    ),
  },
  {
    q: "What can I do with $PROM?",
    a: (
      <>
        Three Syndicate departments: <B>R&amp;D Institute</B> (stake → better
        tools → up to 3× easier mining), <B>Recruitment Office</B> (recruit
        miners → more labour → up to 2× easier), and <B>Relief Fund</B>{" "}
        (deposit → $PROM interest).
      </>
    ),
  },
  {
    q: "Do the two difficulty bonuses stack?",
    a: (
      <>
        Yes. R&amp;D gives tools (up to 3×), Recruitment gives labour (up to
        2×). Mining output is tools × labour — they combine.
      </>
    ),
  },
  {
    q: "I don't want hardware. Options?",
    a: (
      <>
        The <B>Hiring Hall</B> — pay a Syndicate miner&apos;s wage and they dig
        for you; the promethium is yours. (Coming at mainnet.)
      </>
    ),
  },
  {
    q: "What's \"agentic mining\"?",
    a: (
      <>
        Running the whole company — mine, stabilize, stake, recruit — from the
        command line through an agent like Claude, via a <code>skill.md</code>.
        The agent pays the same x402 fees you would; no extra cost.
      </>
    ),
  },
  {
    q: "What is x402?",
    a: (
      <>
        Pay-per-call payments: 1 USDC per action, in USDC on Solana. No
        accounts, no subscriptions.
      </>
    ),
  },
  {
    q: "Is there a pre-mine?",
    a: (
      <>
        No. Fair launch, mined from block 1. The 21M $PROM is minted once on
        Solana and locked — released only as coins are mined and stabilized.
      </>
    ),
  },
  {
    q: "Max difficulty discount?",
    a: (
      <>
        3× from the R&amp;D Institute, plus up to 2× from the Recruitment
        Office.
      </>
    ),
  },
];

/**
 * FAQ accordion — one panel open at a time (fan-style), each item header
 * styled like TerminalCard's ASCII title bar, caret reused from the
 * Sidebar's DOCS expand/collapse pattern.
 */
export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border border-border bg-bg-alt/60">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-xs"
            >
              <span className="select-none text-fg-dim">┌─[</span>
              <span className="flex-1 text-fg">{item.q}</span>
              <span className="select-none text-fg-dim">]</span>
              <span className="select-none text-fg-dim">{isOpen ? "▾" : "▸"}</span>
            </button>
            {isOpen && (
              <div className="border-t border-border p-4 text-sm leading-relaxed text-fg-dim">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
