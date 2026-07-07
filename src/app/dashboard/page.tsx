import type { Metadata } from "next";
import DashboardClient from "@/components/dashboard/DashboardClient";

// Hidden section — not linked in the sidebar and kept out of the index
// until it goes public. To reveal it: add { href: "/dashboard", label: "…" }
// to Sidebar TOP, drop the robots block below, and add it to sitemap.ts.
export const metadata: Metadata = {
  title: "Network Observatory",
  description:
    "Live state of the Promethium Chain — PROM mined vs decayed, miners, nodes, block height, mining power, and the 17.7h surface-decay curve.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <DashboardClient />;
}
