import { NextResponse } from "next/server";
import fs from "node:fs";

export const dynamic = "force-dynamic";

// GET /api/pool/miner/<prom1...> -> that miner's pending owed, paid-to-date, hashrate.
const STATS = process.env.PROM_POOL_STATS_PATH || "/home/clawd/.prom/pool_stats.json";

export async function GET(_req: Request, ctx: { params: Promise<{ addr: string }> }) {
  try {
    const { addr } = await ctx.params;
    const address = decodeURIComponent(addr).trim();
    const d = JSON.parse(fs.readFileSync(STATS, "utf8"));
    const m = d.miners?.[address];
    if (!m) return NextResponse.json({ online: true, found: false, address });
    return NextResponse.json({ online: true, found: true, address, updated: d.updated, ...m });
  } catch {
    return NextResponse.json({ online: false, message: "Pool stats are building — check back shortly." });
  }
}
