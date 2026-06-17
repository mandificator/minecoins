import type { Metadata } from "next";
import TerminalCard from "@/components/ui/TerminalCard";
import { NeonLink } from "@/components/ui/NeonButton";
import { solanaConfig } from "@/lib/solana/config";

export const metadata: Metadata = {
  title: "Block Explorer — Promethium",
  description: "Browse the Promethium Chain block explorer.",
};

export default function ExplorerPage() {
  const url = solanaConfig.explorerUrl;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-neon-green">Block Explorer</h1>
      <p className="mb-6 max-w-2xl text-sm text-fg-dim">
        Promethium Chain uses an open-source, Bitcoin-codebase block explorer hosted
        separately from this site. We don&apos;t rebuild it here — we link
        straight to it.
      </p>

      <div className="border border-border">
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2 font-mono text-xs">
          <span>
            <span className="text-fg-dim">┌─[</span>
            <span className="uppercase tracking-widest text-neon-cyan">
              {" "}
              EXPLORER{" "}
            </span>
            <span className="text-fg-dim">]─┐</span>
          </span>
          {url && (
            <NeonLink href={url} color="cyan" external className="!px-3 !py-1">
              OPEN EXPLORER ↗
            </NeonLink>
          )}
        </div>

        {url ? (
          <iframe
            src={url}
            title="Promethium Chain block explorer"
            className="h-[70vh] w-full bg-bg-alt"
          />
        ) : (
          <div className="p-10">
            <TerminalCard title="NOT CONFIGURED" accent="amber">
              <p className="mb-4 text-sm text-fg">
                Explorer endpoint not configured yet. The block explorer URL is
                published on{" "}
                <span className="neon-cyan">minecoins.work</span> and wired in
                via <code className="text-neon-green">NEXT_PUBLIC_EXPLORER_URL</code>.
              </p>
              <NeonLink
                href="https://minecoins.work"
                color="cyan"
                external
              >
                OPEN EXPLORER ↗
              </NeonLink>
            </TerminalCard>
          </div>
        )}
      </div>
    </div>
  );
}
