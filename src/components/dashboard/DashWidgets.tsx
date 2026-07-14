"use client";

import { useEffect, useState } from "react";
import { Corners } from "@/components/ui/Panel";

/* ---------------- formatting ---------------- */

export function fmtProm(v: number, fracDigits = 8): { int: string; frac: string } {
  const [i, f] = Math.max(0, v).toFixed(fracDigits).split(".");
  return { int: Number(i).toLocaleString("en-US"), frac: f ?? "" };
}

export function fmtInt(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

export function hashfmt(h: number) {
  if (!h) return "—";
  const u = ["H/s", "kH/s", "MH/s", "GH/s", "TH/s", "PH/s"];
  let i = 0,
    v = h;
  while (v >= 1000 && i < u.length - 1) {
    v /= 1000;
    i++;
  }
  return `${v.toFixed(2)} ${u[i]}`;
}

/* ---------------- split-flap board ----------------
   Every digit sits on its own plate (stock-exchange flap
   board); a plate flips when its digit changes. Separators
   (, .) are printed between plates, not on them. */

export function Flaps({ text }: { text: string }) {
  return (
    <span className="dash-flaps">
      {text.split("").map((ch, i) =>
        /[0-9]/.test(ch) ? (
          <span key={i} className="dash-flap">
            <span key={ch} className="dash-flap-inner">
              {ch}
            </span>
          </span>
        ) : (
          <span key={i} className="dash-flap-sep">
            {ch}
          </span>
        ),
      )}
    </span>
  );
}

/* ---------------- UTC clock ---------------- */

export function UtcClock() {
  const [s, setS] = useState("");
  useEffect(() => {
    const f = () =>
      setS(new Date().toISOString().slice(0, 19).replace("T", " ") + " UTC");
    f();
    const id = setInterval(f, 1000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{s}</span>;
}

/* ---------------- live-ticking number ----------------
   Counts up to `base` on mount, then drifts at `perSec`.
   Updates in discrete steps (like a split-flap board), not
   per-frame — each step flips the plates that changed. */

export function useLiveValue(base: number, perSec: number, riseMs = 1700) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const step = () => {
      const el = performance.now() - t0;
      if (reduced || el >= riseMs) {
        const drift = reduced ? el : el - riseMs;
        setV(base + (perSec * drift) / 1000);
      } else {
        const p = 1 - Math.pow(1 - el / riseMs, 3); // ease-out cubic
        setV(base * p);
      }
    };
    step();
    const id = setInterval(step, 120);
    return () => clearInterval(id);
  }, [base, perSec, riseMs]);
  return v;
}

/* ---------------- hero figure ----------------
   size="default" matches /dashboard (wraps to its own row if the
   panel gets narrow); size="lg" is for the homepage — bigger, and
   guaranteed to stay on one line (flex-nowrap + a taller-but-safe
   clamp, see .home-hero-row in globals.css). */

export function Hero({
  label,
  note,
  value,
  perSec,
  size = "default",
  fracDigits = 8,
}: {
  label: string;
  note: string;
  value: number;
  perSec: number;
  size?: "default" | "lg";
  fracDigits?: number;
}) {
  const v = useLiveValue(value, perSec);
  const { int, frac } = fmtProm(v, fracDigits);
  const rowClass =
    size === "lg" ? "home-hero-row flex-nowrap" : "dash-hero-row flex-wrap";
  return (
    <section className="dash-panel relative p-5 sm:p-7">
      <Corners />
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4">
        <span className="dash-label">{label}</span>
        <span className="dash-note">{note}</span>
      </div>
      <div className={`${rowClass} flex items-end gap-y-2 overflow-hidden font-bold text-fg`}>
        <span className="dash-hero-int">
          <Flaps text={int} />
        </span>
        <span className="dash-hero-frac flex items-end">
          <span className="dash-flap-sep">.</span>
          <span className="dash-flap dash-flap-long">
            <span>{frac}</span>
          </span>
        </span>
      </div>
      <div className="dash-note mt-1">PROM</div>
    </section>
  );
}

/* ---------------- stat tile ---------------- */

export function Tile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="dash-panel relative p-4">
      <Corners />
      <div className="dash-note">{label}</div>
      <div className="dash-stat truncate text-title">{value}</div>
      <div className="dash-note">{sub}</div>
    </div>
  );
}
