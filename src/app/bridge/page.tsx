import type { Metadata } from "next";
import { NeonLink } from "@/components/ui/NeonButton";
import BlinkCursor from "@/components/effects/BlinkCursor";
import ConstructionWidget from "@/components/ui/ConstructionWidget";

export const metadata: Metadata = {
  title: "The Stabilization Plant",
  description:
    "Decant surfaced PROMETHIUM into stable $PROM on Solana. Agentic by design. Coming soon.",
};

export default function BridgePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="mb-2 text-2xl font-bold text-amber">
        STABILIZATION PLANT [ coming soon <BlinkCursor className="text-amber" /> ]
      </h1>
      <p className="mx-auto mb-8 max-w-md text-sm text-fg-dim">
        Decant surfaced PROMETHIUM into stable $PROM on Solana before the 17.7h
        half-life eats it. Agentic by design — an agent stabilizes the instant it
        surfaces, while you sleep.
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
