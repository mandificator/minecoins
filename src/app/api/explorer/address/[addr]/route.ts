import { NextResponse } from "next/server";
import { promRpc, CHAIN_LAUNCHING } from "@/lib/promRpc";

export const dynamic = "force-dynamic";

// GET /api/explorer/address/[addr]?window=N
// -> balance (from the UTXO set) + which recent blocks this address mined.
// "mined blocks" is a bounded coinbase scan over the last N blocks (default 250,
// max 2000) so it stays responsive without a full address index.
export async function GET(
  req: Request,
  { params }: { params: { addr: string } }
) {
  const addr = decodeURIComponent(params.addr).trim();
  const url = new URL(req.url);
  const windowReq = parseInt(url.searchParams.get("window") || "250", 10);
  const WINDOW = Math.min(Math.max(isNaN(windowReq) ? 250 : windowReq, 1), 2000);

  if (!/^(prom1|prom)[0-9a-zA-Z]+$/.test(addr)) {
    return NextResponse.json({ error: "Not a Promethium address." }, { status: 400 });
  }
  let tip: number;
  try {
    const info = await promRpc<any>("getblockchaininfo");
    tip = info.blocks;
  } catch {
    return NextResponse.json(CHAIN_LAUNCHING);
  }

  try {
    // balance + UTXOs from the live UTXO set
    const scan = await promRpc<any>("scantxoutset", ["start", [`addr(${addr})`]]);
    const balance = scan?.total_amount ?? 0;
    const utxos = (scan?.unspents || []).length;

    // mined blocks: scan coinbase payouts over the recent window
    const mined: number[] = [];
    const from = Math.max(0, tip - WINDOW + 1);
    for (let h = tip; h >= from; h--) {
      const hash = await promRpc<string>("getblockhash", [h]);
      const b = await promRpc<any>("getblock", [hash, 2]);
      const cb = b.tx?.[0];
      if (cb?.vout?.some((v: any) => v.scriptPubKey?.address === addr)) mined.push(h);
    }

    return NextResponse.json({
      online: true,
      coin: "PROM",
      address: addr,
      balance,
      utxos,
      minedBlocks: mined,
      minedCount: mined.length,
      scannedWindow: WINDOW,
      note:
        tip + 1 > WINDOW
          ? `Mined-block scan covers the last ${WINDOW} blocks (tip ${tip}). Use ?window= to widen (max 2000).`
          : `Scanned the full chain (tip ${tip}).`,
    });
  } catch {
    return NextResponse.json({ error: "Address lookup failed." }, { status: 500 });
  }
}
