import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { solanaConfig, RELIEF_MIN_STAKE_DAYS } from "@/lib/solana/config";

export const dynamic = "force-dynamic";

const INTENTS_FILE = process.env.BATTERY_INTENTS_FILE || "/home/clawd/clawd/prom-stake/battery-intents.jsonl";
// Relief staking is "open" server-side only once BATTERY_USDC_PAY_TO is set (the battery's
// USDC account). Same gate the pay route uses — a reliable server env (not a NEXT_PUBLIC var).
const OPEN = (process.env.BATTERY_USDC_PAY_TO || "").trim().length > 0;
const ACTIONS = new Set(["stake", "unstake", "claim"]);
// Yield starts at the global START (buffer); claiming is rejected before then.
const START_TS = 1784190600; // 2026-07-16 08:30 UTC

// POST /api/battery/intent  { action: "stake"|"unstake"|"claim", address, amount? }
// Creates a Relief Fund action intent and returns the details + the x402 pay
// endpoint. The agent pays the 1-USDC fee to the BATTERY via
// /api/battery/pay/<intentId>; for a stake it also sends the $PROM to the stake
// account. The intentId ties the fee payment to the action.
export async function POST(req: Request) {
  if (!OPEN) {
    return NextResponse.json({ error: "Relief Fund staking is not open yet." }, { status: 503 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const action = String(body.action || "").trim().toLowerCase();
  const address = String(body.address || "").trim();
  const amount = body.amount === undefined ? undefined : Number(body.amount);

  if (!ACTIONS.has(action)) {
    return NextResponse.json({ error: "action must be one of: stake, unstake, claim." }, { status: 400 });
  }
  if (action === "claim" && Date.now() / 1000 < START_TS) {
    return NextResponse.json({ error: "Claiming opens when the Relief Fund starts (08:30 UTC) — yield begins accruing then." }, { status: 425 });
  }
  // A prom1… address can decode as a Solana pubkey — reject it so nobody targets an address they don't control.
  if (/^prom/i.test(address)) {
    return NextResponse.json({ error: "That looks like a Promethium address. Use your SOLANA wallet address." }, { status: 400 });
  }
  try {
    new PublicKey(address);
  } catch {
    return NextResponse.json({ error: "Enter a valid Solana address." }, { status: 400 });
  }
  if (action === "stake" && !(Number(amount) > 0)) {
    return NextResponse.json({ error: "stake requires a positive amount." }, { status: 400 });
  }

  const intentId = randomBytes(8).toString("hex"); // 16 hex chars
  const intent = {
    intentId,
    ts: Date.now(),
    status: "pending",
    action,
    address,
    amount: action === "stake" ? amount : undefined,
    stakeAddress: solanaConfig.batteryStakeAddress,
    batteryAddress: solanaConfig.batteryAddress,
  };

  try {
    await fs.mkdir(path.dirname(INTENTS_FILE), { recursive: true });
    await fs.appendFile(INTENTS_FILE, JSON.stringify(intent) + "\n");
  } catch (e: any) {
    return NextResponse.json({ error: "Could not record the intent.", detail: String(e?.message || e) }, { status: 500 });
  }

  const instructions =
    action === "stake"
      ? `Send ${amount} $PROM to the stake account ${solanaConfig.batteryStakeAddress}, then pay 1 USDC via /api/battery/pay/${intentId} (x402). Both together stake your $PROM; the 30-day lock starts on deposit.`
      : action === "unstake"
        ? `Pay 1 USDC via /api/battery/pay/${intentId} (x402) to request an unstake. Your principal is returned by the Relief Fund once the ${RELIEF_MIN_STAKE_DAYS}-day lock has passed.`
        : `Pay 1 USDC via /api/battery/pay/${intentId} (x402) to claim your accrued yield in $PROM.`;

  return NextResponse.json({
    intentId,
    action,
    address,
    amount: intent.amount,
    stakeAddress: solanaConfig.batteryStakeAddress,
    batteryAddress: solanaConfig.batteryAddress,
    usdcMemo: intentId, // if paying by direct transfer instead of x402, carry this memo
    payEndpoint: `/api/battery/pay/${intentId}`,
    instructions,
  });
}
