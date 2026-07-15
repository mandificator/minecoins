import { NextResponse } from "next/server";
import { promises as fs } from "fs";

export const dynamic = "force-dynamic";

// Read-only: a wallet's Relief Fund stake + 30-day lock + LIVE accrued yield, from
// the stake-indexer + monitor state files (no chain call). Powers the "your stake"
// readout, the moving accrued-yield number, and gates WITHDRAW.
const STAKERS = process.env.STAKE_STATE || "/home/clawd/clawd/prom-stake/stakers.json";
const MON = process.env.SOLANA_MONITOR_STATE || "/home/clawd/clawd/prom-solana-monitor/state.json";
const LOCK_DAYS = 30;
const DAILY_RATE = 0.02;
const SECONDS_PER_DAY = 86400;
// Global YIELD start (buffer): time-weight only accrues after this instant, so
// everyone who staked in the buffer begins earning together. 2026-07-16 08:30 UTC.
// (Unlock is separate + individual per address — NOT gated by this.)
const START_TS = 1784190600;

// Next daily-distributor run = 08:30 UTC (the distributor cron runs CRON_TZ=UTC 30 8).
function nextAutopayAt(): number {
  const now = Date.now();
  const d = new Date(now);
  const t = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 8, 30, 0);
  return Math.floor((now < t ? t : t + 86400000) / 1000);
}

export async function GET(req: Request) {
  const addr = new URL(req.url).searchParams.get("address");
  if (!addr) return NextResponse.json({ error: "address required" }, { status: 400 });

  let rec: any = null;
  let totalStake = 0;
  try {
    const s = JSON.parse(await fs.readFile(STAKERS, "utf8"));
    rec = s[addr] || null;
    totalStake = (Object.values(s) as any[]).reduce((a, v) => a + (v?.balance || 0), 0);
  } catch {
    /* no stakers file yet */
  }

  let battery = 0;
  try {
    const m = JSON.parse(await fs.readFile(MON, "utf8"));
    battery = m?.battery?.prom ?? 0;
  } catch {}

  const now = Date.now() / 1000;
  const staked = rec?.balance || 0;
  const firstTs = rec?.first_ts || 0;
  const daysStaked = firstTs ? (now - firstTs) / 86400 : 0;
  const lockDaysLeft = firstTs ? Math.max(0, LOCK_DAYS - daysStaked) : 0;
  const started = now >= START_TS;

  // accrue time-weight to now, but only for time AFTER the global start; cap at 24h.
  const twStored = rec?.tw_accum || 0;
  const lastTs = rec?.last_ts || now;
  const effLast = Math.max(lastTs, START_TS);
  const twNow = Math.min(twStored + staked * Math.max(0, now - effLast), staked * SECONDS_PER_DAY);
  const perTw = battery > 0 && totalStake > 0 ? (DAILY_RATE * battery) / (SECONDS_PER_DAY * totalStake) : 0;
  const accruedYield = twNow * perTw; // $PROM claimable right now (0 during the buffer)
  const atCap = staked > 0 && twNow >= staked * SECONDS_PER_DAY - 1;
  const accrualRatePerSec = !started || atCap ? 0 : staked * perTw; // 0 while paused
  const dailyYieldPct = staked > 0 && battery > 0 && totalStake > 0 ? (DAILY_RATE * battery / totalStake) * 100 : 0;

  return NextResponse.json({
    address: addr,
    staked,
    firstTs,
    lockDaysLeft: Math.ceil(lockDaysLeft),
    unlockable: staked > 0 && lockDaysLeft <= 0,
    unlockAt: firstTs ? firstTs + LOCK_DAYS * SECONDS_PER_DAY : null,
    startAt: START_TS, // global yield-start (buffer); yield paused until then
    started,
    nextAutopayAt: nextAutopayAt(),
    accruedYield,
    accrualRatePerSec,
    dailyYieldPct,
    battery,
    totalStake,
  });
}
