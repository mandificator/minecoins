import { NextResponse } from "next/server";
import { promises as fs } from "fs";

export const dynamic = "force-dynamic";

// x402 payment gate for the bridge fee (1 USDC on Solana → the dev address).
// Same facilitator pattern as our other x402 services (raw /verify + /settle).
const FACILITATOR = process.env.X402_FACILITATOR_URL || "https://facilitator.x402endpoints.online";
const USDC_MINT = process.env.USDC_MINT || "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // Solana mainnet USDC
const PAY_TO = process.env.BRIDGE_USDC_PAY_TO || ""; // dev's USDC token account — set at launch
// x402 SVM fixes: payTo must be the dev WALLET (client derives the ATA itself, not ATA-of-ATA),
// and extra.feePayer (the facilitator's Solana fee-payer, which sponsors the tx) is REQUIRED by the SDK.
const PAY_TO_WALLET = process.env.BRIDGE_USDC_PAY_TO_WALLET || "AFAGicmTvYxtuEsUBwet2EYtbB1r7C6TZCWkm9gbGexa";
const X402_FEE_PAYER = process.env.X402_FEE_PAYER || "9JRPU5K4haWWo1g3WSjCaq283uYcbxvfdEATkaSLw9X8";
const PUBLIC_BASE = process.env.PUBLIC_BASE_URL || "https://promethium.work";
const PRICE = process.env.BRIDGE_USDC_PRICE || "1000000"; // 1 USDC (6 decimals)
const NETWORK = process.env.X402_NETWORK || "solana";
const X402_VERSION = 1;
const INTENTS_FILE = process.env.BRIDGE_INTENTS_FILE || "/home/clawd/clawd/prom-bridge/intents.jsonl";

// Intents are append-only JSONL; the latest record per intentId wins (status updates are appended).
async function loadIntent(intentId: string): Promise<any | null> {
  try {
    const txt = await fs.readFile(INTENTS_FILE, "utf8");
    let intent: any = null;
    for (const line of txt.split("\n")) {
      if (!line.trim()) continue;
      const o = JSON.parse(line);
      if (o.intentId === intentId) intent = { ...intent, ...o };
    }
    return intent;
  } catch {
    return null;
  }
}

function paymentRequirements(intentId: string, resource: string) {
  return {
    scheme: "exact",
    network: NETWORK,
    maxAmountRequired: PRICE,
    resource,
    description: `Promethium bridge fee for intent ${intentId}`,
    mimeType: "application/json",
    payTo: PAY_TO_WALLET,
    maxTimeoutSeconds: 120,
    asset: USDC_MINT,
    extra: { intentId, feePayer: X402_FEE_PAYER },
  };
}

// GET/POST /api/bridge/pay/[intentId]
//  - no X-PAYMENT header  -> 402 with the payment requirements (1 USDC → dev)
//  - with X-PAYMENT       -> verify + settle via the facilitator, mark the intent paid
// Served on BOTH GET and POST: the x402 spec is method-agnostic (payment rides in the
// X-PAYMENT header, not the body) and our docs/skill document GET, so a standard x402
// client hitting GET must get the same challenge + settle path — otherwise its payment
// settles out-of-band and we never record the intentId->payment link (stranding the payer).
export async function GET(req: Request, ctx: { params: { intentId: string } }) {
  return handlePay(req, ctx.params.intentId);
}
export async function POST(req: Request, ctx: { params: { intentId: string } }) {
  return handlePay(req, ctx.params.intentId);
}

async function handlePay(req: Request, intentId: string) {
  const intent = await loadIntent(intentId);
  if (!intent) return NextResponse.json({ error: "Unknown bridge intent." }, { status: 404 });
  if (intent.status === "paid") {
    return NextResponse.json({ paid: true, intentId, alreadyPaid: true });
  }
  if (!PAY_TO) {
    // Activated at launch by setting BRIDGE_USDC_PAY_TO to the dev's USDC token account.
    return NextResponse.json({ error: "Bridge payment not live yet." }, { status: 503 });
  }

  const reqs = paymentRequirements(intentId, `${PUBLIC_BASE}/api/bridge/pay/${intentId}`);

  const xPayment = req.headers.get("X-PAYMENT");
  if (!xPayment) {
    return NextResponse.json(
      { x402Version: X402_VERSION, accepts: [reqs], error: "Payment required." },
      { status: 402 }
    );
  }

  let payload: any;
  try {
    payload = JSON.parse(Buffer.from(xPayment, "base64").toString("utf8"));
  } catch {
    return NextResponse.json({ error: "Malformed X-PAYMENT." }, { status: 400 });
  }

  const body = { x402Version: X402_VERSION, paymentPayload: payload, paymentRequirements: reqs };

  const v = await fetch(`${FACILITATOR}/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!v.ok) return NextResponse.json({ error: `verify HTTP ${v.status}` }, { status: 402 });
  const vj: any = await v.json();
  if (!vj.isValid) {
    return NextResponse.json({ error: `Payment rejected: ${vj.invalidReason || "unknown"}` }, { status: 402 });
  }

  const s = await fetch(`${FACILITATOR}/settle`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const sj: any = s.ok ? await s.json() : {};
  if (!sj.success) {
    return NextResponse.json({ error: `Settle failed: ${sj.errorReason || "unknown"}` }, { status: 402 });
  }

  // Mark the intent paid (append a status record) so the deposit matcher can settle it.
  await fs.appendFile(
    INTENTS_FILE,
    JSON.stringify({ intentId, status: "paid", settleTx: sj.transaction, payer: vj.payer, ts: Date.now() }) + "\n"
  );

  return NextResponse.json({ paid: true, intentId, settleTx: sj.transaction, payer: vj.payer });
}
