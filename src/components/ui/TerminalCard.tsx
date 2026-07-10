import type { ReactNode } from "react";
import Panel from "@/components/ui/Panel";

/** Dashboard-style panel: dashed border, corner ticks, dash-label title. */
export default function TerminalCard({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Panel label={title} className={className}>
      {children}
    </Panel>
  );
}
