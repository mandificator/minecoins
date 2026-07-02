import { NextResponse } from "next/server";
import fs from "node:fs";

export const dynamic = "force-dynamic";

// GET /api/pool -> pool-wide stats + top miners (from cached pool_stats.json,
// built every ~2 min by pool-stats-export.py from the pool sqlite db).
const STATS = process.env.PROM_POOL_STATS_PATH || "/home/clawd/.prom/pool_stats.json";

export async function GET() {
  try {
    const d = JSON.parse(fs.readFileSync(STATS, "utf8"));
    return NextResponse.json({ online: true, updated: d.updated, pool: d.pool, top: d.top });
  } catch {
    return NextResponse.json({ online: false, message: "Pool stats are building — check back shortly." });
  }
}
