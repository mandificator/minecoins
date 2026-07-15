import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";

const pexec = promisify(execFile);
export const dynamic = "force-dynamic";

// POST /api/stake/sync — kick the stake indexer so a just-confirmed stake is credited
// immediately (instead of waiting for the */10 cron). Read-only (the indexer never
// sends $PROM). `flock -n` collapses concurrent/spam calls into a single run.
export async function POST() {
  try {
    await pexec(
      "flock",
      ["-n", "/tmp/prom-stake-sync.lock", "python3", "/home/clawd/clawd/prom-stake/stake-indexer.py", "sync"],
      { timeout: 30000, cwd: "/home/clawd/clawd/prom-stake" },
    );
    return NextResponse.json({ ok: true });
  } catch {
    // flock busy (exit 1) or timeout — a sync is already running/just ran; fine.
    return NextResponse.json({ ok: true, note: "sync already in progress" });
  }
}
