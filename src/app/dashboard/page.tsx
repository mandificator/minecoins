import type { Metadata } from "next";
import DashboardClient from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Live state of the Promethium Chain — PROM mined vs decayed, entangled + relief fund on Solana, miners, nodes, block height, and mining power.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
