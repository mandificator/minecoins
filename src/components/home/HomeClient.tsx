"use client";

import { useEffect, useState } from "react";
import HomeHeader from "@/components/home/HomeHeader";
import HomeBottomMenu from "@/components/home/HomeBottomMenu";
import { Hero, Tile, fmtInt, hashfmt } from "@/components/dashboard/DashWidgets";
import {
  fetchDashboardData,
  HALF_LIFE_HOURS,
  type DashboardData,
} from "@/lib/dashboardData";

export default function HomeClient() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetchDashboardData().then(setData).catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <HomeHeader />

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
                note="decayed PROM in the battery on Solana"
                value={data.reliefProm}
                perSec={0}
                size="lg-half"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Tile label="MINERS" value={fmtInt(data.miners)} sub="active · 24h" />
              <Tile label="NODES" value={fmtInt(data.nodes)} sub="reachable" />
              <Tile
                label="CURRENT BLOCK"
                value={`#${fmtInt(data.blockHeight)}`}
                sub="chain tip"
              />
              <Tile
                label="MINING POWER"
                value={hashfmt(data.networkHashps)}
                sub="network hashrate"
              />
            </div>
          </div>
        )}
      </main>

      <HomeBottomMenu />
    </div>
  );
}
