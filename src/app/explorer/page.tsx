import type { Metadata } from "next";
import ExplorerClient from "@/components/explorer/ExplorerClient";

export const metadata: Metadata = {
  title: "Block Explorer",
  description:
    "Verify every block, transaction, and address on the Promethium Chain — search it yourself or ask your agent.",
};

export default function ExplorerPage() {
  return <ExplorerClient />;
}
