"use client";

import { useEffect, useState } from "react";
import { Corners } from "@/components/ui/Panel";

type DiffAdjust = {
  online: boolean;
  blocksLeft: number;
  nextRetargetHeight: number;
  windowBlocks: number;
  windowElapsedPct: number;
  avgBlockSec: number;
  targetSpacingSec: number;
  predictedPct: number;
  direction: "up" | "down" | "flat";
  etaSeconds: number;
};

function human(sec: number) {
  if (!sec || sec < 0) return "—";
  const h = sec / 3600;
  if (h < 48) return `~${h.toFixed(0)}h`;
  return `~${(h / 24).toFixed(1)} days`;
}

// Next-difficulty-adjust readout. Palette stays monochrome (blue/white per the
// site theme) — direction is carried by the arrow glyph + word, not colour.
export default function DiffAdjust() {
  const [d, setD] = useState<DiffAdjust | null>(null);

  useEffect(() => {
    fetch("/api/diff-adjust", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (j && j.online) setD(j);
      })
      .catch(() => {});
  }, []);

  if (!d) return null;

  const flat = d.direction === "flat";
  const up = d.direction === "up";
  const arrow = flat ? "▬" : up ? "▲" : "▼";
  const word = flat ? "STEADY" : up ? "HARDER" : "EASIER";
  const sign = d.predictedPct >= 0 ? "+" : "";
  const avgMin = (d.avgBlockSec / 60).toFixed(1);
  const targetMin = (d.targetSpacingSec / 60).toFixed(0);

  return (
    <section className="dash-panel relative p-5 sm:p-7">
      <Corners />
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4">
        <span className="dash-label">NEXT DIFFICULTY ADJUST</span>
        <span className="dash-note">
          in {d.blocksLeft.toLocaleString("en-US")} blocks · {human(d.etaSeconds)}
        </span>
      </div>
      <div className="flex items-end gap-3 font-bold text-title">
        <span className="dash-stat">
          {arrow} {sign}
          {d.predictedPct.toFixed(0)}%
        </span>
        <span className="dash-note mb-1">{word}</span>
      </div>
      <div className="dash-note mt-2">
        this window: {d.windowBlocks.toLocaleString("en-US")} blks @ {avgMin} min
        (target {targetMin}) · {d.windowElapsedPct.toFixed(0)}% elapsed — estimate
        firms up as it fills
      </div>
    </section>
  );
}
