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

// Next daily-distributor run. Cron is `30 8 * * *` in the VPS local TZ; Node runs
// in the same system TZ, so computing 08:30 local matches the cron and is DST-safe.
function nextAutopayAt(): number {
  const t = new Date();
  t.setHours(8, 30, 0, 0);
  if (t.getTime() <= Date.now()) t.setDate(t.getDate() + 1);
  return Math.floor(t.getTime() / 1000);
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

  // accrue time-weight to now, capped at 24h of the current stake (matches the backend)
  const twStored = rec?.tw_accum || 0;
  const lastTs = rec?.last_ts || now;
  const twNow = Math.min(twStored + staked * Math.max(0, now - lastTs), staked * SECONDS_PER_DAY);
  const perTw = battery > 0 && totalStake > 0 ? (DAILY_RATE * battery) / (SECONDS_PER_DAY * totalStake) : 0;
  const accruedYield = twNow * perTw; // $PROM claimable right now
  const atCap = staked > 0 && twNow >= staked * SECONDS_PER_DAY - 1;
  const accrualRatePerSec = atCap ? 0 : staked * perTw; // $PROM/sec the number ticks up
  // yield over a full day as a % of the stake (asymptotic — normalises as more $PROM stakes)
  const dailyYieldPct = staked > 0 && battery > 0 && totalStake > 0 ? (DAILY_RATE * battery / totalStake) * 100 : 0;

  return NextResponse.json({
    address: addr,
    staked,
    firstTs,
    lockDaysLeft: Math.ceil(lockDaysLeft),
    unlockable: staked > 0 && lockDaysLeft <= 0,
    unlockAt: firstTs ? firstTs + LOCK_DAYS * SECONDS_PER_DAY : null, // unix s — unstake countdown
    nextAutopayAt: nextAutopayAt(), // unix s — next battery autopayment countdown
    accruedYield,
    accrualRatePerSec,
    dailyYieldPct,
    battery,
    totalStake,
  });
}
