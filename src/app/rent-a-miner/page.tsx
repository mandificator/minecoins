import type { Metadata } from "next";
import { NeonLink } from "@/components/ui/NeonButton";
import BlinkCursor from "@/components/effects/BlinkCursor";
import ConstructionWidget from "@/components/ui/ConstructionWidget";
import AsciiDiagram from "@/components/ui/AsciiDiagram";

export const metadata: Metadata = {
  title: "Rent a Miner — Coming Soon",
  description: "Mine Promethium without owning hardware. Coming soon.",
};

const ART = `   ┌─────────────────────────────┐
   │  ▄▄▄  UNDER CONSTRUCTION ▄▄▄ │
   │   ▟█▙   ▟█▙   ▟█▙   ▟█▙      │
   │  ▟███▙ ▟███▙ ▟███▙ ▟███▙     │
   └─────────────────────────────┘`;

export default function RentAMinerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <div className="mx-auto mb-6 max-w-sm">
        <AsciiDiagram text={ART} center />
      </div>

      <h1 className="mb-2 text-2xl font-bold text-amber">
        [ UNDER CONSTRUCTION <BlinkCursor className="text-amber" /> ]
      </h1>
      <p className="mx-auto mb-8 max-w-md text-sm text-fg-dim">
        Rent a Miner is coming soon. Mine Promethium without owning hardware.
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
