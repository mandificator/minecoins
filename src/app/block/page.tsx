import type { Metadata } from "next";
import BlockClient from "@/components/block/BlockClient";

export const metadata: Metadata = {
  title: "Live Block",
  description:
    "The current tip of the Promethium Chain, live — block height, difficulty, network hashrate, and the latest block, straight from the node.",
};

export default function BlockPage() {
  return <BlockClient />;
}
