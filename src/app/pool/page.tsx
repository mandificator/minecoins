import type { Metadata } from "next";
import PoolClient from "@/components/pool/PoolClient";

export const metadata: Metadata = {
  title: "Mining Pool",
  description:
    "Promethium shared mining pool — check your pending payout and total earned, and watch live pool stats.",
};

export default function PoolPage() {
  return <PoolClient />;
}
