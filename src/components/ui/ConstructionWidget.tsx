"use client";

import { useEffect, useState } from "react";

const TOTAL = 16;

export default function ConstructionWidget() {
  const [pct, setPct] = useState(38);

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

  return (
    <div className="space-y-6">
      <pre className="ascii text-neon-green text-sm md:text-base">
        {`[${bar}] ${pct}%`}
      </pre>
    </div>
  );
}
