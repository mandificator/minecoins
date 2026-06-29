import { NextResponse } from "next/server";
import { promRpc, CHAIN_LAUNCHING } from "@/lib/promRpc";

export const dynamic = "force-dynamic";

// GET /api/explorer/block/[id] -> a Promethium block by height or hash.
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = decodeURIComponent(params.id).trim();
  try {
    await promRpc("getblockchaininfo"); // probe: is the chain live?
  } catch {
    return NextResponse.json(CHAIN_LAUNCHING);
  }
  try {
    const hash = /^\d+$/.test(id)
      ? await promRpc<string>("getblockhash", [parseInt(id, 10)])
      : id;
    const b = await promRpc<any>("getblock", [hash, 2]);
    const coinbase = b.tx?.[0];
    const minerOut = coinbase?.vout?.find(
      (v: any) => v.scriptPubKey?.address
    )?.scriptPubKey?.address;
    const reward = (coinbase?.vout || []).reduce(
      (s: number, v: any) => s + (v.value || 0),
      0
    );
    return NextResponse.json({
      online: true,
      coin: "PROM",
      height: b.height,
      hash: b.hash,
      time: b.time,
      txCount: b.nTx ?? b.tx.length,
      size: b.size,
      difficulty: b.difficulty,
      previousBlockHash: b.previousblockhash ?? null,
      nextBlockHash: b.nextblockhash ?? null,
      miner: minerOut ?? null,
      reward,
      tx: (b.tx || []).map((t: any) => (typeof t === "string" ? t : t.txid)),
    });
  } catch {
    return NextResponse.json({ error: "Block not found." }, { status: 404 });
  }
}
