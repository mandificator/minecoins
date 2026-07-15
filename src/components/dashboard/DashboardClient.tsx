"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardBottomMenu from "@/components/dashboard/DashboardBottomMenu";
import DiffAdjust, {
  fetchDiffAdjust,
  type DiffAdjustData,
} from "@/components/dashboard/DiffAdjust";
import { Hero, Tile, fmtInt, hashfmt } from "@/components/dashboard/DashWidgets";
import {
  fetchDashboardData,
  HALF_LIFE_HOURS,
  type DashboardData,
} from "@/lib/dashboardData";

export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [diff, setDiff] = useState<DiffAdjustData | null>(null);

  useEffect(() => {
    fetchDashboardData().then(setData).catch(() => {});
    fetchDiffAdjust().then(setDiff).catch(() => {});
  }, []);

  const blockPace =
    diff == null
      ? "syncing…"
      : diff.avgBlockSec < diff.targetSpacingSec
        ? "faster than target"
        : diff.avgBlockSec > diff.targetSpacingSec
          ? "slower than target"
          : "on target";

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />

      <main className="mx-auto flex w-full max-w-[120rem] flex-1 flex-col items-center justify-center gap-8 px-4 py-10 sm:px-12">
        {!data && <p className="dash-note">SYNCING…</p>}

        {data && (
          <div className="w-full space-y-4">
            {/* stacked full-width so each figure gets the whole row —
                more room = bigger type without ever risking overflow */}
            <Hero
              label="TOTAL PROM MINED"
              note="all blocks since genesis"
              value={data.minedProm}
              perSec={data.minedPerSec}
              size="lg"
            />
            <Hero
              label="TOTAL PROM DECAYED"
              note={`lost to the surface · t½ = ${HALF_LIFE_HOURS}h`}
              value={data.decayedProm}
              perSec={data.decayedPerSec}
              size="lg"
            />

            {/* entangled + relief fund share one row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Hero
                label="ENTANGLED ON SOLANA"
                note="sent to users + LPs from dev"
                value={data.entangledProm}
                perSec={0}
                size="lg-half"
              />
              <Hero
                label="RELIEF FUND"
                note="decayed PROM in the Relief Fund on Solana"
                value={data.reliefProm}
                perSec={0}
                size="lg-half"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              <Tile label="MINERS" value={fmtInt(data.miners)} sub="active · 24h" />
              <Tile label="NODES" value={fmtInt(data.nodes)} sub="reachable" />
              <Tile
                label="CURRENT BLOCK"
                value={`#${fmtInt(data.blockHeight)}`}
                sub="chain tip"
              />
              <Tile
                label="AVG BLOCK TIME"
                value={diff ? `${(diff.avgBlockSec / 60).toFixed(1)} min` : "—"}
                sub={
                  diff
                    ? `target ${(diff.targetSpacingSec / 60).toFixed(0)} min · ${blockPace}`
                    : "syncing…"
                }
              />
              <Tile
                label="MINING POWER"
                value={hashfmt(data.networkHashps)}
                sub="network hashrate"
              />
            </div>

            {/* next difficulty retarget: blocks left + up/down estimate */}
            <DiffAdjust data={diff} />
          </div>
        )}
      </main>

      <DashboardBottomMenu />
    </div>
  );
}
