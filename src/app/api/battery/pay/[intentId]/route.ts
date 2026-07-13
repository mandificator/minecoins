import { NextResponse } from "next/server";
import { promises as fs } from "fs";

export const dynamic = "force-dynamic";

// x402 payment gate for a Relief Fund action fee (1 USDC on Solana → the BATTERY,
// not dev). Same facilitator pattern as the bridge pay route. On settle we mark the
// intent paid AND append the action to the request queue for the (held) processor.
const FACILITATOR = process.env.X402_FACILITATOR_URL || "https://facilitator.x402endpoints.online";
const USDC_MINT = process.env.USDC_MINT || "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
// The battery's USDC token account — set at launch to open the endpoint (503 until then).
const PAY_TO = process.env.BATTERY_USDC_PAY_TO || "";
// payTo must be the battery WALLET (client derives the ATA); extra.feePayer is the facilitator's fee-payer.
const PAY_TO_WALLET = process.env.BATTERY_PAY_TO_WALLET || "2Cd8YiSbw6G5S1VgUGFdd3E6oeKYoQqt2Aemoey1GoZT";
const X402_FEE_PAYER = process.env.X402_FEE_PAYER || "9JRPU5K4haWWo1g3WSjCaq283uYcbxvfdEATkaSLw9X8";
const PUBLIC_BASE = process.env.PUBLIC_BASE_URL || "https://promethium.work";
const PRICE = process.env.BATTERY_USDC_PRICE || "1000000"; // 1 USDC (6 decimals)
const NETWORK = process.env.X402_NETWORK || "solana";
const X402_VERSION = 1;
const INTENTS_FILE = process.env.BATTERY_INTENTS_FILE || "/home/clawd/clawd/prom-stake/battery-intents.jsonl";
const REQUESTS_FILE = process.env.STAKE_REQUESTS || "/home/clawd/clawd/prom-stake/unstake-requests.jsonl";

// Intents are append-only JSONL; the latest record per intentId wins.
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

function paymentRequirements(intent: any, resource: string) {
  return {
    scheme: "exact",
    network: NETWORK,
    maxAmountRequired: PRICE,
    resource,
    description: `Promethium Relief Fund ${intent.action} fee for intent ${intent.intentId}`,
    mimeType: "application/json",
    payTo: PAY_TO_WALLET,
    maxTimeoutSeconds: 120,
    asset: USDC_MINT,
    extra: { intentId: intent.intentId, feePayer: X402_FEE_PAYER },
  };
}

// GET/POST /api/battery/pay/[intentId]
//  - no X-PAYMENT header  -> 402 with the payment requirements (1 USDC → battery)
//  - with X-PAYMENT       -> verify + settle via the facilitator, mark the intent paid,
//                            and queue the action for the (held) processor.
export async function GET(req: Request, ctx: { params: { intentId: string } }) {
  return handlePay(req, ctx.params.intentId);
}
export async function POST(req: Request, ctx: { params: { intentId: string } }) {
  return handlePay(req, ctx.params.intentId);
}

async function handlePay(req: Request, intentId: string) {
  const intent = await loadIntent(intentId);
  if (!intent) return NextResponse.json({ error: "Unknown Relief Fund intent." }, { status: 404 });
  if (intent.status === "paid") {
    return NextResponse.json({ paid: true, intentId, alreadyPaid: true });
  }
  if (!PAY_TO) {
    return NextResponse.json({ error: "Relief Fund staking is not open yet." }, { status: 503 });
  }

  const reqs = paymentRequirements(intent, `${PUBLIC_BASE}/api/battery/pay/${intentId}`);

  const xPayment = req.headers.get("X-PAYMENT");
  if (!xPayment) {
    return NextResponse.json(
      { x402Version: X402_VERSION, accepts: [reqs], error: "Payment required." },
      { status: 402 },
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

  // Mark the intent paid + queue the action for the (held) processor.
  await fs.appendFile(
    INTENTS_FILE,
    JSON.stringify({ intentId, status: "paid", settleTx: sj.transaction, payer: vj.payer, ts: Date.now() }) + "\n",
  );
  await fs.appendFile(
    REQUESTS_FILE,
    JSON.stringify({
      type: intent.action,
      staker: intent.address,
      amount: intent.amount,
      intentId,
      usdcSig: sj.transaction,
      via: "x402",
      ts: Date.now(),
      status: "requested",
    }) + "\n",
  );

  return NextResponse.json({ paid: true, intentId, action: intent.action, settleTx: sj.transaction, payer: vj.payer });
}
