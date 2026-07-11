import { NextResponse } from "next/server";
import { promises as fs } from "fs";

export const dynamic = "force-dynamic";

const F = process.env.IMPRINTS_FILE || "/home/clawd/clawd/prom-imprints/imprints.jsonl";

// GET /api/imprints -> { imprints: [{height, blockhash, unixtime, memo, solana_sig}], count }
export async function GET() {
  let items: any[] = [];
  try {
    const t = await fs.readFile(F, "utf8");
    items = t.split("\n").filter(Boolean).map((l) => JSON.parse(l));
  } catch {}
  items.reverse(); // newest first
  return NextResponse.json({ imprints: items, count: items.length });
}
