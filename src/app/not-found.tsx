import { NeonLink } from "@/components/ui/NeonButton";
import BlinkCursor from "@/components/effects/BlinkCursor";
import Panel from "@/components/ui/Panel";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <Panel label="404" note="segment not found" className="mx-auto mb-8 max-w-xs">
        <p className="font-mono text-sm text-fg-dim">
          &gt; the path you requested does not exist <BlinkCursor />
        </p>
      </Panel>
      <NeonLink href="/" color="green">
        ◂ BACK TO HOME
      </NeonLink>
    </div>
  );
}
