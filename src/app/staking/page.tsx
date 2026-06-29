import type { Metadata } from "next";
import { NeonLink } from "@/components/ui/NeonButton";
import BlinkCursor from "@/components/effects/BlinkCursor";
import ConstructionWidget from "@/components/ui/ConstructionWidget";

export const metadata: Metadata = {
  title: "Investment",
  description:
    "Put your $PROM to work in the Promethium Mining Syndicate: R&D Institute and Relief Fund. Coming soon.",
};

export default function StakingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="mb-2 text-2xl font-bold text-amber">
        INVESTMENT [ coming soon <BlinkCursor className="text-amber" /> ]
      </h1>
      <p className="mx-auto mb-8 max-w-md text-sm text-fg-dim">
        Put your $PROM to work in the Promethium Mining Syndicate — the R&amp;D
        Institute (mine up to 3× easier) and the Relief Fund (earn $PROM
        interest, no decay). Two independent pools, join one or both.
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
