import type { Metadata } from "next";
import { NeonLink } from "@/components/ui/NeonButton";
import BlinkCursor from "@/components/effects/BlinkCursor";
import ConstructionWidget from "@/components/ui/ConstructionWidget";

export const metadata: Metadata = {
  title: "Block Explorer",
  description:
    "Verify every block, transaction, and address on the Promethium Chain yourself. Coming soon.",
};

export default function ExplorerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="mb-2 text-2xl font-bold text-amber">
        EXPLORER [ coming soon <BlinkCursor className="text-amber" /> ]
      </h1>
      <p className="mx-auto mb-8 max-w-md text-sm text-fg-dim">
        Unlike other tokens that <em>claim</em> to be Proof-of-Work, here you
        will be able to check it yourself — verify every block, every
        transaction, and every address on the Promethium Chain.
      </p>

      <ConstructionWidget />

      <div className="mt-10">
        <NeonLink href="/" color="green">
          ◂ BACK TO HOME
        </NeonLink>
      </div>
    </div>
  );
}
