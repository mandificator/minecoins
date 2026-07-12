import type { Metadata } from "next";
import TreasuryClient from "@/components/treasury/TreasuryClient";

// Internal — not linked in the sidebar, kept out of the index.
export const metadata: Metadata = {
  title: "Treasury",
  description: "Live balances of every protocol-controlled address, PROM chain + Solana.",
  robots: { index: false, follow: false },
};

export default function TreasuryPage() {
  return <TreasuryClient />;
}
