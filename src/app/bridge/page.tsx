import type { Metadata } from "next";
import BridgeClient from "./BridgeClient";

// Internal, not public: keep it out of search indexes. (It's also unlinked.)
export const metadata: Metadata = {
  title: "PROM Bridge — internal",
  robots: { index: false, follow: false },
};

export default function BridgePage() {
  return <BridgeClient />;
}
