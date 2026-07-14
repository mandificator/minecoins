"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
        <Image
          src="/img/promethium-logo.png"
          alt="Promethium — Pm, element 61, [145]"
          width={500}
          height={500}
          priority
          className="h-auto w-full max-w-[7rem] border border-border sm:max-w-[8rem]"
        />

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
              fracDigits={2}
            />
            <Hero
              label="TOTAL PROM DECAYED"
              note={`lost to the surface · t½ = ${HALF_LIFE_HOURS}h`}
              value={data.decayedProm}
              perSec={data.decayedPerSec}
              size="lg"
              fracDigits={2}
            />

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
