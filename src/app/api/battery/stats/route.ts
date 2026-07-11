import { NextResponse } from "next/server";
import { promises as fs } from "fs";

export const dynamic = "force-dynamic";

// Reads the read-only monitor + stake-indexer state files (no chain call here).
const MON = process.env.SOLANA_MONITOR_STATE || "/home/clawd/clawd/prom-solana-monitor/state.json";
const STAKERS = process.env.STAKE_STATE || "/home/clawd/clawd/prom-stake/stakers.json";
const RELEASE_PCT = 2;

// GET /api/battery/stats -> { batteryBalance, totalStaked, stakerCount, dailyReleasePct, estDailyYieldPctOnStake }
export async function GET() {
  let batteryBalance = 0;
  let totalStaked = 0;
  let stakerCount = 0;

  try {
    const m = JSON.parse(await fs.readFile(MON, "utf8"));
    batteryBalance = m?.battery?.prom ?? 0;
  } catch {}

  try {
    const s = JSON.parse(await fs.readFile(STAKERS, "utf8"));
    const vals = Object.values(s) as any[];
    stakerCount = vals.length;
    totalStaked = vals.reduce((a, v) => a + (v?.balance || 0), 0);
  } catch {}

  const estDailyYieldPctOnStake =
    totalStaked > 0 ? Math.round(((batteryBalance * (RELEASE_PCT / 100)) / totalStaked) * 10000) / 100 : null;

  return NextResponse.json({
    batteryBalance,
    totalStaked,
    stakerCount,
    dailyReleasePct: RELEASE_PCT,
    estDailyYieldPctOnStake,
  });
}
