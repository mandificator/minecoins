import type { Metadata } from "next";
import { NeonLink } from "@/components/ui/NeonButton";
import BlinkCursor from "@/components/effects/BlinkCursor";
import ConstructionWidget from "@/components/ui/ConstructionWidget";
import Panel from "@/components/ui/Panel";

export const metadata: Metadata = {
  title: "Investment",
  description:
    "Put your $PROM to work in the Promethium Mining Syndicate: R&D Institute and Relief Fund. Coming soon.",
};

export default function StakingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="dash-title mb-2 font-bold text-title">INVESTMENT</h1>
      <p className="dash-note mb-6">
        status: coming soon <BlinkCursor />
      </p>
      <p className="mx-auto mb-8 max-w-md text-sm text-fg-dim">
        Put your $PROM to work in the Promethium Mining Syndicate — the R&amp;D
        Institute (mine up to 3× easier) and the Relief Fund (earn $PROM
        interest, no decay). Two independent pools, join one or both.
      </p>

      <Panel label="BUILD PROGRESS" note="not live yet">
        <ConstructionWidget />
      </Panel>

      <div className="mt-10">
        <NeonLink href="/" color="green">
          ◂ BACK TO HOME
        </NeonLink>
      </div>
    </div>
  );
}
