"use client";

import { useEffect, useState } from "react";

const TOTAL = 16;

export default function ConstructionWidget() {
  const [pct, setPct] = useState(38);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">(
    "idle"
  );

  // Fake "breathing" progress around 38% so the bar feels alive.
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) return;
    let dir = 1;
    const id = setInterval(() => {
      setPct((p) => {
        if (p >= 41) dir = -1;
        if (p <= 35) dir = 1;
        return p + dir;
      });
    }, 600);
    return () => clearInterval(id);
  }, []);

  const filled = Math.round((pct / 100) * TOTAL);
  const bar = "█".repeat(filled) + "░".repeat(TOTAL - filled);

  async function notify(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "ok" : "err");
      if (res.ok) setEmail("");
    } catch {
      setStatus("err");
    }
  }

  return (
    <div className="space-y-6">
      <pre className="ascii text-neon-green text-sm md:text-base">
        {`[${bar}] ${pct}%`}
      </pre>

      <form onSubmit={notify} className="mx-auto flex max-w-md gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@domain.tld"
          className="flex-1 border border-border bg-bg px-3 py-2 font-mono text-sm text-fg outline-none focus:border-neon-green"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="border border-neon-green px-3 py-2 text-xs uppercase tracking-wider text-neon-green hover:bg-white/[0.03] disabled:opacity-40"
        >
          [ NOTIFY ME ]
        </button>
      </form>
      {status === "ok" && (
        <p className="text-xs text-neon-green">
          ✓ Saved. We&apos;ll ping you when Rent a Miner goes live.
        </p>
      )}
      {status === "err" && (
        <p className="text-xs text-amber">
          Couldn&apos;t save right now — try again later.
        </p>
      )}
    </div>
  );
}
