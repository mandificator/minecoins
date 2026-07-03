import { NextResponse } from "next/server";
import { promRpc, CHAIN_LAUNCHING } from "@/lib/promRpc";

export const dynamic = "force-dynamic";

// GET /api/explorer/tx/[txid] -> a Promethium transaction.
// Requires the node to run with -txindex for arbitrary tx lookup.
export async function GET(
  _req: Request,
  { params }: { params: { txid: string } }
) {
  const txid = decodeURIComponent(params.txid).trim();
  try {
    await promRpc("getblockchaininfo");
  } catch {
    return NextResponse.json(CHAIN_LAUNCHING);
  }
  try {
    const t = await promRpc<any>("getrawtransaction", [txid, true]);
    const isCoinbase = (t.vin || []).some((i: any) => i.coinbase);
    return NextResponse.json({
      online: true,
      coin: "PROM",
      txid: t.txid,
      hash: t.hash ?? null, // wtxid (differs from txid when there's witness data)
      blockHash: t.blockhash ?? null,
      confirmations: t.confirmations ?? 0,
      time: t.time ?? null,
      size: t.size ?? null,
      vsize: t.vsize ?? null,
      weight: t.weight ?? null,
      version: t.version ?? null,
      locktime: t.locktime ?? null,
      coinbase: isCoinbase,
      vin: (t.vin || []).map((i: any) =>
        i.coinbase
          ? { coinbase: i.coinbase, witness: i.txinwitness ?? null }
          : {
              txid: i.txid,
              vout: i.vout,
              // full witness stack (hex items) — inscriptions/data live here
              witness: i.txinwitness ?? null,
            }
      ),
      vout: (t.vout || []).map((o: any) => ({
        value: o.value,
        n: o.n,
        address: o.scriptPubKey?.address ?? null,
        type: o.scriptPubKey?.type ?? null,
        scriptPubKeyHex: o.scriptPubKey?.hex ?? null,
      })),
      totalOut: (t.vout || []).reduce((s: number, o: any) => s + (o.value || 0), 0),
      // full raw transaction hex (serialized, includes the witness) for extraction/verification
      hex: t.hex ?? null,
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Transaction not found. (Tx lookup needs the node's transaction index.)",
      },
      { status: 404 }
    );
  }
}
