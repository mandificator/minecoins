import { NextResponse } from "next/server";
import { promises as fs } from "fs";

export const dynamic = "force-dynamic";

// Read-only: reports a wallet's Relief Fund stake + 30-day lock status from the
// stake-indexer state (no chain call). Powers the "your stake" readout + gates WITHDRAW.
const STAKERS = process.env.STAKE_STATE || "/home/clawd/clawd/prom-stake/stakers.json";
const LOCK_DAYS = 30;

export async function GET(req: Request) {
  const addr = new URL(req.url).searchParams.get("address");
  if (!addr) return NextResponse.json({ error: "address required" }, { status: 400 });

  let staked = 0;
  let firstTs = 0;
  try {
    const s = JSON.parse(await fs.readFile(STAKERS, "utf8"));
    const rec = s[addr];
    if (rec) {
      staked = rec.balance || 0;
      firstTs = rec.first_ts || 0;
    }
  } catch {
    /* no stakers file yet */
  }

  const now = Math.floor(Date.now() / 1000);
  const daysStaked = firstTs ? (now - firstTs) / 86400 : 0;
  const lockDaysLeft = firstTs ? Math.max(0, LOCK_DAYS - daysStaked) : 0;

  return NextResponse.json({
    address: addr,
    staked,
    firstTs,
    lockDaysLeft: Math.ceil(lockDaysLeft),
    unlockable: staked > 0 && lockDaysLeft <= 0,
  });
}
