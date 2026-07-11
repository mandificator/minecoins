import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { promRpc } from "@/lib/promRpc";
import { solanaConfig, BRIDGE_FEE_PCT } from "@/lib/solana/config";

export const dynamic = "force-dynamic";

const INTENTS_FILE = process.env.BRIDGE_INTENTS_FILE || "/home/clawd/clawd/prom-bridge/intents.jsonl";
const MAGIC = Buffer.from("PRMB"); // 4-byte marker so the matcher can spot our OP_RETURNs

// Bridge cap = current block subsidy (50 now, halves every 210k blocks).
function subsidyFor(height: number): number {
  return 50 / Math.pow(2, Math.floor(height / 210000));
}

// POST /api/bridge/intent  { fromAddress, amount, solAddress }
// -> creates a bridge intent and returns the exact PROM send command (with the
//    OP_RETURN) plus the USDC memo. The OP_RETURN encodes: MAGIC(4) +
//    intentId(8) + Solana pubkey(32) = 44 bytes (well under the 80-byte limit),
//    so a deposit is self-describing AND correlatable to the USDC payment.
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const fromAddress = String(body.fromAddress || "").trim();
  const solAddress = String(body.solAddress || "").trim();
  const amount = Number(body.amount);

  if (!/^prom1[0-9a-z]{20,}$/.test(fromAddress)) {
    return NextResponse.json({ error: "Enter a valid PROM (prom1…) from-address." }, { status: 400 });
  }
  if (!(amount > 0)) {
    return NextResponse.json({ error: "Amount must be a positive number." }, { status: 400 });
  }
  // A Promethium (prom1…) address can coincidentally decode as a Solana pubkey — reject it
  // outright so nobody sends their $PROM into an address they do not control.
  if (/^prom/i.test(solAddress)) {
    return NextResponse.json({ error: "That looks like a Promethium address. Enter your SOLANA wallet address — it never starts with \"prom\"." }, { status: 400 });
  }
  let solPk: PublicKey;
  try {
    solPk = new PublicKey(solAddress);
  } catch {
    return NextResponse.json({ error: "Enter a valid destination Solana address." }, { status: 400 });
  }

  let height = 0;
  try {
    height = await promRpc<number>("getblockcount");
  } catch {
    return NextResponse.json({ error: "PROM node unreachable." }, { status: 503 });
  }
  const cap = subsidyFor(height);
  if (amount > cap + 1e-9) {
    return NextResponse.json(
      { error: `Amount exceeds the ${cap}-PROM per-transaction cap.` },
      { status: 400 }
    );
  }

  const intentId = randomBytes(8).toString("hex"); // 16 hex chars
  const opReturn = Buffer.concat([MAGIC, Buffer.from(intentId, "hex"), solPk.toBuffer()]); // 44 bytes
  const opReturnHex = opReturn.toString("hex");
  const bridgeAddress = solanaConfig.promBridgeAddress;

  // One-line PROM node command: send `amount` to the bridge address + attach the OP_RETURN.
  const command = `prom-cli -named send outputs='{"${bridgeAddress}": ${amount}, "data": "${opReturnHex}"}' fee_rate=1`;

  const intent = {
    intentId,
    ts: Date.now(),
    status: "pending",
    fromAddress,
    solAddress,
    amount,
    bridgeAddress,
    opReturnHex,
    heightAtQuote: height,
    bridgeFeeAddress: solanaConfig.bridgeFeeAddress,
    bridgeFeePct: BRIDGE_FEE_PCT, // 2% of healthy → fee address, at settle
  };

  try {
    await fs.mkdir(path.dirname(INTENTS_FILE), { recursive: true });
    await fs.appendFile(INTENTS_FILE, JSON.stringify(intent) + "\n");
  } catch (e: any) {
    return NextResponse.json(
      { error: "Could not record the intent.", detail: String(e?.message || e) },
      { status: 500 }
    );
  }

  return NextResponse.json({
    intentId,
    bridgeAddress,
    opReturnHex,
    command,
    amount,
    solAddress,
    usdcMemo: intentId, // the 1-USDC Solana payment must carry this memo
    bridgeFeeAddress: solanaConfig.bridgeFeeAddress,
    bridgeFeePct: BRIDGE_FEE_PCT, // 2% of the healthy $PROM goes here
  });
}
