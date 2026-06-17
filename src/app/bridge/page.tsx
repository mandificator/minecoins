import type { Metadata } from "next";
import BridgePanel from "@/components/web3/BridgePanel";

export const metadata: Metadata = {
  title: "Bridge — Promethium",
  description: "Move Promethium from Promethium Chain onto Solana as the $PROM token.",
};

export default function BridgePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-neon-cyan">Bridge</h1>
      <p className="mb-8 max-w-2xl text-sm text-fg-dim">
        Move your Promethium from Promethium Chain onto Solana, where they become the
        $PROM token — automatic, simple, and one-way (coin → token only).
      </p>
      <BridgePanel />
    </div>
  );
}
