import { NeonLink } from "@/components/ui/NeonButton";
import BlinkCursor from "@/components/effects/BlinkCursor";
import AsciiDiagram from "@/components/ui/AsciiDiagram";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <div className="mx-auto mb-6 max-w-xs">
        <AsciiDiagram
          center
          text={`  ┌─[ 404 ]─────────────┐
  │  segment not found  │
  └─────────────────────┘`}
        />
      </div>
      <p className="mb-8 font-mono text-sm text-fg-dim">
        &gt; the path you requested does not exist{" "}
        <BlinkCursor className="text-neon-green" />
      </p>
      <NeonLink href="/" color="green">
        ◂ BACK TO HOME
      </NeonLink>
    </div>
  );
}
