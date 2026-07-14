import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { execFile } from "child_process";
import { promisify } from "util";
import { promRpc } from "@/lib/promRpc";

export const dynamic = "force-dynamic";

// Live telemetry for /dashboard (Network Observatory). Reads real sources:
//   mined / decayed / alive  -> prom-decay indexer "report" (canonical decay math)
//   height / hashrate / nodes / block subsidy -> Promethium RPC
//   miners -> pool stats export
//   x402Count -> distinct paid bridge intents (USDC micropayments settled)

const pexec = promisify(execFile);
const DECAY_DIR = process.env.PROM_DECAY_DIR || "/home/clawd/clawd/prom-decay";
const INTENTS = process.env.PROM_INTENTS_PATH || "/home/clawd/clawd/prom-bridge/intents.jsonl";
const POOL_STATS = process.env.PROM_POOL_STATS_PATH || "/home/clawd/.prom/pool_stats.json";
const HALF_LIFE_SEC = 17.7 * 3600;

// in-memory cache so frequent loads don't spawn python / hammer the RPC
let CACHE: { at: number; data: unknown } | null = null;
const TTL_MS = 30_000;

async function decayAggregate() {
  const { stdout } = await pexec("/usr/bin/python3", ["decay-indexer.py", "report"], {
    cwd: DECAY_DIR,
    timeout: 9000,
    maxBuffer: 8_000_000,
  });
  const m = stdout.match(
    /total nominal:\s*([\d.]+)\s*\|\s*HEALTHY:\s*([\d.]+)\s*\|\s*DECAYED:\s*([\d.]+)/i,
  );
  if (!m) throw new Error("decay report parse failed");
  return { mined: +m[1], alive: +m[2], decayed: +m[3] };
}

async function countX402(): Promise<number> {
  // one bridge deposit = one 1-USDC x402 payment; count distinct settled intents
  const raw = await fs.readFile(INTENTS, "utf8");
  const paid = new Set<string>();
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    try {
      const o = JSON.parse(line);
      if (o.intentId && (o.usdcSig || o.settleTx || o.paid)) paid.add(o.intentId);
    } catch {
      /* skip malformed line */
    }
  }
  return paid.size;
}

export async function GET() {
  if (CACHE && Date.now() - CACHE.at < TTL_MS) {
    return NextResponse.json(CACHE.data);
  }

  // decay aggregate (mined / decayed / alive)
  let mined = 0;
  let decayed = 0;
  let alive = 0;
  try {
    ({ mined, decayed, alive } = await decayAggregate());
  } catch {
    /* leave zeros; client falls back to simulated if minedProm is 0 */
  }

  // chain telemetry
  let blockHeight = 0;
  let networkHashps = 0;
  let avgBlockTime = 60;
  let nodes = 0;
  let subsidy = 50;
  try {
    const info = await promRpc<{ blocks: number }>("getblockchaininfo");
    blockHeight = info.blocks ?? 0;
    const mining = await promRpc<{ networkhashps: number }>("getmininginfo").catch(
      () => ({ networkhashps: 0 }),
    );
    networkHashps = mining.networkhashps ?? 0;
    const cstats = await promRpc<{ window_block_count: number; window_interval: number }>(
      "getchaintxstats",
      [144],
    ).catch(() => null);
    if (cstats?.window_block_count) {
      avgBlockTime = cstats.window_interval / cstats.window_block_count;
    }
    nodes = (await promRpc<number>("getconnectioncount").catch(() => 0)) ?? 0;
    if (blockHeight) {
      const bs = await promRpc<{ subsidy: number }>("getblockstats", [blockHeight]).catch(
        () => null,
      );
      if (bs?.subsidy) subsidy = bs.subsidy / 1e8;
    }
  } catch {
    /* chain unreachable; leave defaults */
  }

  // miners (pool stats export)
  let miners = 0;
  try {
    const ps = JSON.parse(await fs.readFile(POOL_STATS, "utf8"));
    miners = ps?.pool?.miners ?? 0;
  } catch {
    /* pool stats missing */
  }

  // x402 usage
  let x402Count = 0;
  try {
    x402Count = await countX402();
  } catch {
    /* intents unreadable */
  }

  const data = {
    simulated: false,
    minedProm: mined,
    decayedProm: decayed,
    minedPerSec: avgBlockTime > 0 ? subsidy / avgBlockTime : 0,
    decayedPerSec: (alive * Math.LN2) / HALF_LIFE_SEC,
    miners,
    nodes,
    blockHeight,
    networkHashps,
    x402Count,
  };
  CACHE = { at: Date.now(), data };
  return NextResponse.json(data);
}
