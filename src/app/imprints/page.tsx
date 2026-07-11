import type { Metadata } from "next";
import { promises as fs } from "fs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Chain Imprints",
  description:
    "The Promethium chain's state anchored to Solana twice a day — a tamper-proof, publicly verifiable checkpoint against reorgs and double-spends.",
};

const F = process.env.IMPRINTS_FILE || "/home/clawd/clawd/prom-imprints/imprints.jsonl";

export default async function ImprintsPage() {
  let items: any[] = [];
  try {
    const t = await fs.readFile(F, "utf8");
    items = t.split("\n").filter(Boolean).map((l) => JSON.parse(l));
  } catch {}
  items.reverse();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-3 text-2xl font-bold text-title">Chain Imprints</h1>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-fg-dim">
        Every ~12 hours we anchor the Promethium chain onto Solana: a memo transaction from the
        Promethium dev address stamps the current <span className="text-fg">block height</span> and{" "}
        <span className="text-fg">block hash</span> permanently onto the Solana ledger. The block hash
        commits to the entire chain history, so each imprint is a tamper-proof public checkpoint —
        anyone can confirm that Promethium block #H really has the imprinted hash, and a deep reorg or
        double-spend that rewrote history past an imprint would visibly contradict these anchors.
      </p>

      {items.length === 0 ? (
        <p className="text-fg-dim">No imprints yet.</p>
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-border text-left text-fg-dim">
                <th className="px-3 py-2">PROM height</th>
                <th className="px-3 py-2">Block hash</th>
                <th className="px-3 py-2">Time (UTC)</th>
                <th className="px-3 py-2">Solana proof</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.solana_sig} className="border-b border-border/60">
                  <td className="px-3 py-2 text-fg">{i.height?.toLocaleString?.() ?? i.height}</td>
                  <td className="px-3 py-2 text-fg-dim break-all">{i.blockhash}</td>
                  <td className="px-3 py-2 text-fg-dim">
                    {new Date(i.unixtime * 1000).toISOString().replace("T", " ").slice(0, 16)}
                  </td>
                  <td className="px-3 py-2">
                    <a
                      href={`https://solscan.io/tx/${i.solana_sig}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neon-cyan hover:underline"
                    >
                      view tx →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-xs text-fg-dim">
        Verify yourself: on the{" "}
        <a href="/explorer" className="text-neon-cyan hover:underline">explorer</a>, look up the block
        at that height and confirm its hash matches. Cross-check the Solana transaction memo for the
        same values.
      </p>
    </div>
  );
}
