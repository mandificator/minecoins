import { NextResponse } from "next/server";
import fs from "node:fs";

export const dynamic = "force-dynamic";

// GET /api/explorer/richlist -> top PROM holders (from the cached richlist.json
// built periodically by richlist.py; computing it per-request would be too heavy).
const RICHLIST = process.env.PROM_RICHLIST_PATH || "/home/clawd/.prom/richlist.json";

export async function GET() {
  try {
    const data = JSON.parse(fs.readFileSync(RICHLIST, "utf8"));
    return NextResponse.json({ online: true, coin: "PROM", ...data });
  } catch {
    return NextResponse.json({
      online: false,
      message: "Rich list is building — check back shortly.",
    });
  }
}
