import { NextResponse } from "next/server";
import { promRpc } from "@/lib/promRpc";

export const dynamic = "force-dynamic";

// Promethium uses standard Bitcoin difficulty retargeting.
const INTERVAL = 2016; // blocks per retarget window
const TARGET_SPACING = 600; // 10-minute target block time (seconds)
const TARGET_TIMESPAN = INTERVAL * TARGET_SPACING; // two weeks

// GET /api/diff-adjust
// Predicts the next difficulty retarget from the OPEN retarget window to date —
// the same data the protocol uses at the retarget block: elapsed time of the
// current window extrapolated to a full 2016 blocks, clamped to Bitcoin's +/-4x
// limits. Read-only; aggregate numbers only (no addresses/keys).
export async function GET() {
  try {
    const info = await promRpc<any>("getblockchaininfo");
    const tip = info.blocks as number;
    const difficulty = info.difficulty as number;

    const lastRetarget = Math.floor(tip / INTERVAL) * INTERVAL;
    const nextRetargetHeight = lastRetarget + INTERVAL;
    const blocksLeft = nextRetargetHeight - tip;
    const windowBlocks = tip - lastRetarget; // mined so far this window

    let avgBlockSec = TARGET_SPACING;
    let projectedRatio = 1;
    if (windowBlocks > 0) {
      const [startHash, tipHash] = await Promise.all([
        promRpc<string>("getblockhash", [lastRetarget]),
        promRpc<string>("getblockhash", [tip]),
      ]);
      const [startHeader, tipHeader] = await Promise.all([
        promRpc<any>("getblockheader", [startHash]),
        promRpc<any>("getblockheader", [tipHash]),
      ]);
      const elapsed = tipHeader.time - startHeader.time;
      if (elapsed > 0) {
        avgBlockSec = elapsed / windowBlocks;
        const projectedTimespan = avgBlockSec * INTERVAL;
        // clamp to Bitcoin's +/-4x per-retarget limits
        projectedRatio = Math.max(
          0.25,
          Math.min(4, TARGET_TIMESPAN / projectedTimespan),
        );
      }
    }
    const predictedPct = (projectedRatio - 1) * 100;
    const direction =
      predictedPct > 1 ? "up" : predictedPct < -1 ? "down" : "flat";

    return NextResponse.json({
      online: true,
      height: tip,
      difficulty,
      intervalBlocks: INTERVAL,
      nextRetargetHeight,
      blocksLeft,
      windowBlocks,
      windowElapsedPct: (windowBlocks / INTERVAL) * 100,
      avgBlockSec,
      targetSpacingSec: TARGET_SPACING,
      projectedRatio,
      predictedPct,
      direction,
      etaSeconds: Math.round(blocksLeft * avgBlockSec),
    });
  } catch {
    return NextResponse.json({ online: false });
  }
}
