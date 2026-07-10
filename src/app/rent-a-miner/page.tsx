import type { Metadata } from "next";
import { NeonLink } from "@/components/ui/NeonButton";
import BlinkCursor from "@/components/effects/BlinkCursor";
import ConstructionWidget from "@/components/ui/ConstructionWidget";
import Panel from "@/components/ui/Panel";

export const metadata: Metadata = {
  title: "Hiring Hall",
  description:
    "Pay a Syndicate miner's wage. They dig for you, you keep the promethium. Coming soon.",
};

export default function RentAMinerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="dash-title mb-2 font-bold text-title">HIRING HALL</h1>
      <p className="dash-note mb-6">
        status: coming soon <BlinkCursor />
      </p>
      <p className="mx-auto mb-8 max-w-md text-sm text-fg-dim">
        Mine promethium without owning hardware by renting mining power from the
        Promethium Mining Syndicate. You pay a miner&apos;s wage; they dig for
        you; the promethium is yours.
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
