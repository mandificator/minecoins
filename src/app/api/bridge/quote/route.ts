import { NextResponse } from "next/server";
import { promRpc } from "@/lib/promRpc";
import { execFile } from "child_process";
import { promisify } from "util";

const pexec = promisify(execFile);
export const dynamic = "force-dynamic";

// Path to the internal decay indexer (reads decay.db read-only in `quote` mode).
const INDEXER = process.env.DECAY_INDEXER || "/home/clawd/clawd/prom-decay/decay-indexer.py";

// Bridge cap = current block subsidy (50 now, halves every 210k blocks).
function subsidyFor(height: number): number {
  return 50 / Math.pow(2, Math.floor(height / 210000));
}

// GET /api/bridge/quote?address=prom1...&amount=50
// -> { nominal, healthy, decayed, healthy_fraction, subsidy_cap, over_cap,
//      projected_healthy_spl, projected_to_battery }  (preview only; server
//      recomputes from the actual deposited UTXOs at settle time).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const address = (url.searchParams.get("address") || "").trim();
  const amount = url.searchParams.get("amount");

  if (!/^prom1[0-9a-z]{20,}$/.test(address)) {
    return NextResponse.json({ error: "Enter a valid PROM (prom1…) address." }, { status: 400 });
  }
  if (amount !== null && !(parseFloat(amount) > 0)) {
    return NextResponse.json({ error: "Amount must be a positive number." }, { status: 400 });
  }

  let height = 0;
  try {
    height = await promRpc<number>("getblockcount");
  } catch {
    return NextResponse.json({ error: "PROM node unreachable." }, { status: 503 });
  }
  const cap = subsidyFor(height);

  const args = [INDEXER, "quote", address];
  if (amount !== null) args.push("--amount", amount);

  try {
    const { stdout } = await pexec("python3", args, { timeout: 8000 });
    const data = JSON.parse(stdout);
    const amt = amount !== null ? parseFloat(amount) : null;
    return NextResponse.json({
      ...data,
      subsidy_cap: cap,
      over_cap: amt !== null ? amt > cap + 1e-9 : false,
      tip: height,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Decay quote failed.", detail: String(e?.message || e) },
      { status: 500 }
    );
  }
}
