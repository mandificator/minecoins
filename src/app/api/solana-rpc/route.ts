import { NextResponse } from "next/server";
import { promises as fs } from "fs";

export const dynamic = "force-dynamic";

// Same-origin Solana RPC proxy: forwards the browser's JSON-RPC calls to Helius
// server-side, so the Helius key never ships to the client and the public
// mainnet-beta 403s go away. The wallet-adapter Connection points here.
const HELIUS_KEYS = "/home/clawd/clawd/credentials/helius-keys.json";

async function heliusUrl(): Promise<string> {
  const raw = JSON.parse(await fs.readFile(HELIUS_KEYS, "utf8"));
  const find = (o: any): string | null => {
    if (typeof o === "string" && /^[0-9a-f-]{20,}$/.test(o)) return o;
    if (o && typeof o === "object") for (const v of Object.values(o)) {
      const r = find(v);
      if (r) return r;
    }
    return null;
  };
  return `https://mainnet.helius-rpc.com/?api-key=${find(raw) || ""}`;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

export async function POST(req: Request) {
  const body = await req.text();
  try {
    const url = await heliusUrl();
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    });
    const text = await r.text();
    return new NextResponse(text, {
      status: r.status,
      headers: { "content-type": "application/json", ...CORS },
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 502, headers: CORS });
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
