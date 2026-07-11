import { NextResponse } from "next/server";
import { promises as fs } from "fs";

export const dynamic = "force-dynamic";

// Browser payment path: the connected wallet sends 1 USDC to the dev USDC account,
// then calls this with the tx signature. We verify on-chain (via Helius) that the
// dev received >= 1 USDC, then mark the intent paid. (Agents use the x402 endpoint.)
const INTENTS = process.env.BRIDGE_INTENTS_FILE || "/home/clawd/clawd/prom-bridge/intents.jsonl";
const HELIUS_KEYS = "/home/clawd/clawd/credentials/helius-keys.json";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const DEV = "AFAGicmTvYxtuEsUBwet2EYtbB1r7C6TZCWkm9gbGexa";
const MIN_USDC = 1.0;

async function heliusRpc(): Promise<string> {
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

async function readIntents() {
  try {
    const t = await fs.readFile(INTENTS, "utf8");
    return t.split("\n").filter(Boolean).map((l) => JSON.parse(l));
  } catch {
    return [];
  }
}

function devUsdcDelta(meta: any): number {
  const bal = (bals: any[]) => {
    for (const b of bals || []) {
      if (b.mint === USDC_MINT && b.owner === DEV) return Number(b.uiTokenAmount?.uiAmount || 0);
    }
    return 0;
  };
  return bal(meta?.postTokenBalances) - bal(meta?.preTokenBalances);
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }
  const intentId = String(body.intentId || "").trim();
  const signature = String(body.signature || "").trim();
  if (!intentId || !signature) {
    return NextResponse.json({ error: "intentId and signature required." }, { status: 400 });
  }

  const all = await readIntents();
  const intent = all.reduce((acc: any, o: any) => (o.intentId === intentId ? { ...acc, ...o } : acc), null);
  if (!intent) return NextResponse.json({ error: "Unknown intent." }, { status: 404 });
  if (intent.status === "paid") return NextResponse.json({ paid: true, alreadyPaid: true });
  if (all.some((o) => o.usdcSig === signature)) {
    return NextResponse.json({ error: "This payment was already used." }, { status: 409 });
  }

  let tx: any;
  try {
    const rpc = await heliusRpc();
    const r = await fetch(rpc, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1, method: "getTransaction",
        params: [signature, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }],
      }),
    });
    tx = (await r.json()).result;
  } catch (e: any) {
    return NextResponse.json({ error: "RPC error verifying payment." }, { status: 502 });
  }
  if (!tx) return NextResponse.json({ error: "Transaction not found yet — wait for confirmation and retry." }, { status: 400 });
  if (tx.meta?.err) return NextResponse.json({ error: "Payment transaction failed on-chain." }, { status: 400 });

  const received = devUsdcDelta(tx.meta);
  if (received < MIN_USDC - 1e-6) {
    return NextResponse.json({ error: `Payment not found — dev received ${received} USDC (need ${MIN_USDC}).` }, { status: 400 });
  }

  await fs.appendFile(INTENTS, JSON.stringify({ intentId, status: "paid", usdcSig: signature, ts: Date.now() }) + "\n");
  return NextResponse.json({ paid: true, usdcSig: signature, receivedUsdc: received });
}
