"use client";

import { useEffect, useState } from "react";
import { Tile } from "@/components/dashboard/DashWidgets";
import { RELIEF_RELEASE_PCT } from "@/lib/solana/config";

type FundStats = { totalStaked: number; reliefBalance: number; stakerCount: number };

const fmtNum = (n: number) =>
  n >= 1000 ? Math.round(n).toLocaleString() : n.toLocaleString(undefined, { maximumFractionDigits: 2 });

/** Total staked / fund balance / APR — the Relief Fund's public headline
 * numbers, fetched once here so they show up top of page, not buried
 * inside the (personal) stake panel. */
export default function ReliefFundStats() {
  const [stats, setStats] = useState<FundStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch("/api/battery/stats", { cache: "no-store" })
        .then((r) => r.json())
        .then(
          (d) =>
            !cancelled &&
            setStats({
              totalStaked: d.totalStaked || 0,
              reliefBalance: d.batteryBalance || 0,
              stakerCount: d.stakerCount || 0,
            }),
        )
        .catch(() => {});
    load();
    const id = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!stats) return null;

  const dailyRatePct =
    stats.totalStaked > 0 ? (RELIEF_RELEASE_PCT * stats.reliefBalance) / stats.totalStaked : 0;
  const aprPct = dailyRatePct * 365;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Tile
        label="TOTAL STAKED"
        value={`${fmtNum(stats.totalStaked)} PROM`}
        sub={`${stats.stakerCount} staker${stats.stakerCount === 1 ? "" : "s"}`}
      />
      <Tile label="FUND BALANCE" value={`${fmtNum(stats.reliefBalance)} PROM`} sub="on Solana" />
      <Tile
        label="EST. APR"
        value={stats.totalStaked > 0 ? `~${fmtNum(aprPct)}%` : "—"}
        sub="annualized, uncapped"
      />
    </div>
  );
}
