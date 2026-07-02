import { NextResponse } from "next/server";
import fs from "node:fs";
import { promRpc, CHAIN_LAUNCHING } from "@/lib/promRpc";

export const dynamic = "force-dynamic";

// GET /api/explorer/chain -> Promethium chain summary + latest blocks.
export async function GET() {
  try {
    const info = await promRpc<any>("getblockchaininfo");
    const mining = await promRpc<any>("getmininginfo").catch(() => ({}));
    const cstats = await promRpc<any>("getchaintxstats", [144]).catch(() => null);
    const avgBlockTime =
      cstats && cstats.window_block_count
        ? cstats.window_interval / cstats.window_block_count
        : null;
    // pool hashrate (shares-based) from the pool stats exporter, if present
    let poolHashps: number | null = null;
    try {
      const ps = JSON.parse(
        fs.readFileSync(process.env.PROM_POOL_STATS_PATH || "/home/clawd/.prom/pool_stats.json", "utf8"),
      );
      poolHashps = ps?.pool?.hashrate ?? null;
    } catch {}

    const tip = info.blocks as number;

    // latest few blocks (height, hash, time, tx count, miner)
    const latest: any[] = [];
    for (let h = tip; h > Math.max(-1, tip - 10); h--) {
      const hash = await promRpc<string>("getblockhash", [h]);
      const b = await promRpc<any>("getblock", [hash, 1]);
      latest.push({ height: b.height, hash: b.hash, time: b.time, txCount: b.nTx });
    }

    return NextResponse.json({
      online: true,
      coin: "PROM",
      height: tip,
      bestBlockHash: info.bestblockhash,
      difficulty: info.difficulty,
      medianTime: info.mediantime,
      networkHashps: mining.networkhashps ?? null,
      poolHashps,
      avgBlockTime,
      latest,
    });
  } catch {
    return NextResponse.json(CHAIN_LAUNCHING);
  }
}
