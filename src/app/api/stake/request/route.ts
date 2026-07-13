import { NextResponse } from "next/server";
import { promises as fs } from "fs";

export const dynamic = "force-dynamic";

// Records a Relief Fund UNSTAKE request. The user paid 1 USDC to the BATTERY (not dev)
// and calls this with the tx signature; we verify on-chain (Helius) that the battery
// received >= 1 USDC, then append the request. NO funds move here — the (held) sender
// returns the staked $PROM later, once released and the 30-day lock has passed.
const REQUESTS = process.env.STAKE_REQUESTS || "/home/clawd/clawd/prom-stake/unstake-requests.jsonl";
const HELIUS_KEYS = "/home/clawd/clawd/credentials/helius-keys.json";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const BATTERY = "2Cd8YiSbw6G5S1VgUGFdd3E6oeKYoQqt2Aemoey1GoZT"; // fee lands in the battery's USDC ATA
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

async function readRequests() {
  try {
    const t = await fs.readFile(REQUESTS, "utf8");
    return t.split("\n").filter(Boolean).map((l) => JSON.parse(l));
  } catch {
    return [];
  }
}

function batteryUsdcDelta(meta: any): number {
  const bal = (bals: any[]) => {
    for (const b of bals || []) {
      if (b.mint === USDC_MINT && b.owner === BATTERY) return Number(b.uiTokenAmount?.uiAmount || 0);
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
  const staker = String(body.staker || "").trim();
  const signature = String(body.signature || "").trim();
  const type = String(body.type || "unstake").trim();
  if (!staker || !signature) {
    return NextResponse.json({ error: "staker and signature required." }, { status: 400 });
  }

  const existing = await readRequests();
  if (existing.some((r) => r.usdcSig === signature)) {
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
  } catch {
    return NextResponse.json({ error: "RPC error verifying payment." }, { status: 502 });
  }
  if (!tx) return NextResponse.json({ error: "Transaction not found yet — wait for confirmation and retry." }, { status: 400 });
  if (tx.meta?.err) return NextResponse.json({ error: "Payment transaction failed on-chain." }, { status: 400 });

  const received = batteryUsdcDelta(tx.meta);
  if (received < MIN_USDC - 1e-6) {
    return NextResponse.json({ error: `Fee not found — battery received ${received} USDC (need ${MIN_USDC}).` }, { status: 400 });
  }

  await fs.appendFile(
    REQUESTS,
    JSON.stringify({ type, staker, usdcSig: signature, ts: Date.now(), status: "requested" }) + "\n",
  );
  return NextResponse.json({ ok: true, type, staker, receivedUsdc: received });
}
